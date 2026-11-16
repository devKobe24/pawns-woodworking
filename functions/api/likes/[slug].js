// GET /api/likes/:slug returns { count, liked }; POST likes the post, DELETE takes the like back.
// A browser is identified by the pw_visitor cookie; IP hashes cap how many likes one network can add.
import { isSameOrigin, postExists } from '../../../server/blog.js';

const COOKIE = 'pw_visitor';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// High enough for a household or office behind one IP, low enough to stop scripted likes.
const MAX_LIKES_PER_IP = 20;

function readVisitor(request) {
	const match = (request.headers.get('Cookie') ?? '').match(/(?:^|;\s*)pw_visitor=([^;]+)/);
	return match && UUID.test(match[1]) ? match[1] : null;
}

async function hashIp(request, env) {
	const salt = await env.DB.prepare("SELECT value FROM secrets WHERE name = 'ip_salt'").first('value');
	if (!salt) throw new Error('ip_salt is missing; run the D1 migrations');
	const ip = request.headers.get('CF-Connecting-IP') ?? '';
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ip));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest({ request, params, env }) {
	const { method } = request;
	if (!['GET', 'POST', 'DELETE'].includes(method)) {
		return new Response(null, { status: 405, headers: { Allow: 'GET, POST, DELETE' } });
	}
	if (method !== 'GET' && !isSameOrigin(request)) {
		return Response.json({ error: 'forbidden' }, { status: 403 });
	}
	const { slug } = params;
	if (!(await postExists(request, env, slug))) {
		return Response.json({ error: 'not found' }, { status: 404 });
	}

	const savedVisitor = readVisitor(request);
	const visitor = savedVisitor ?? crypto.randomUUID();
	const headers = { 'Cache-Control': 'no-store' };
	if (!savedVisitor) {
		headers['Set-Cookie'] =
			`${COOKIE}=${visitor}; Path=/api/; Max-Age=31536000; HttpOnly; Secure; SameSite=Strict`;
	}

	if (method === 'POST') {
		const ipHash = await hashIp(request, env);
		const fromIp = await env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE slug = ?1 AND ip_hash = ?2')
			.bind(slug, ipHash)
			.first('n');
		if (fromIp >= MAX_LIKES_PER_IP) {
			return Response.json({ error: 'too many likes from this network' }, { status: 429, headers });
		}
		await env.DB.prepare('INSERT OR IGNORE INTO likes (slug, visitor, ip_hash) VALUES (?1, ?2, ?3)')
			.bind(slug, visitor, ipHash)
			.run();
	} else if (method === 'DELETE') {
		await env.DB.prepare('DELETE FROM likes WHERE slug = ?1 AND visitor = ?2').bind(slug, visitor).run();
	}

	const row = await env.DB.prepare(
		'SELECT COUNT(*) AS count, COALESCE(SUM(visitor = ?2), 0) AS liked FROM likes WHERE slug = ?1',
	)
		.bind(slug, visitor)
		.first();
	return Response.json({ count: row.count, liked: row.liked > 0 }, { headers });
}
