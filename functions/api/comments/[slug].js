// GET /api/comments/:slug lists comments; POST adds one (Turnstile-checked), DELETE removes one by password.
// ADMIN_PASSWORD (a Pages secret) deletes any comment, for moderation.
import { hashIp, isSameOrigin, postExists, toHex } from '../../../server/blog.js';

const LIMITS = { name: 20, body: 1000, password: 50 };
const MIN_PASSWORD = 4;
// Per network: at most this many comments in the window below.
const MAX_COMMENTS_PER_IP = 5;
const WINDOW_SECONDS = 600;
// 10k iterations keeps hashing within the Workers free-plan CPU budget (10ms per request).
const PBKDF2_ITERATIONS = 10000;

const encoder = new TextEncoder();
const noStore = { 'Cache-Control': 'no-store' };
const fail = (status, error) => Response.json({ error }, { status, headers: noStore });

async function hashPassword(password, salt) {
	const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS },
		key,
		256,
	);
	return toHex(bits);
}

async function isAdmin(password, env) {
	if (!env.ADMIN_PASSWORD) return false;
	const [a, b] = await Promise.all(
		[password, env.ADMIN_PASSWORD].map((s) => crypto.subtle.digest('SHA-256', encoder.encode(s))),
	);
	return crypto.subtle.timingSafeEqual(a, b);
}

async function passedTurnstile(token, request, env) {
	if (!env.TURNSTILE_SECRET) throw new Error('TURNSTILE_SECRET is not set');
	if (typeof token !== 'string' || !token) return false;
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: new URLSearchParams({
			secret: env.TURNSTILE_SECRET,
			response: token,
			remoteip: request.headers.get('CF-Connecting-IP') ?? '',
		}),
	});
	return res.ok && (await res.json()).success === true;
}

// Trimmed string within [min, max] characters, or null.
function text(value, min, max) {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
}

async function addComment(request, env, slug, input) {
	const name = text(input.name, 1, LIMITS.name);
	const body = text(input.body, 1, LIMITS.body);
	const password = typeof input.password === 'string' ? input.password : '';
	if (!name || !body || password.length < MIN_PASSWORD || password.length > LIMITS.password) {
		return fail(400, 'invalid comment');
	}
	if (!(await passedTurnstile(input.token, request, env))) return fail(403, 'turnstile failed');

	const ipHash = await hashIp(request, env);
	const recent = await env.DB.prepare(
		'SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ?1 AND created_at > unixepoch() - ?2',
	)
		.bind(ipHash, WINDOW_SECONDS)
		.first('n');
	if (recent >= MAX_COMMENTS_PER_IP) return fail(429, 'too many comments');

	const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
	const comment = await env.DB.prepare(
		`INSERT INTO comments (slug, name, body, password_salt, password_hash, ip_hash)
		VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id, name, body, created_at AS createdAt`,
	)
		.bind(slug, name, body, salt, await hashPassword(password, salt), ipHash)
		.first();
	return Response.json({ comment }, { status: 201, headers: noStore });
}

async function deleteComment(env, slug, input) {
	const password = typeof input.password === 'string' ? input.password : '';
	const row = Number.isInteger(input.id)
		? await env.DB.prepare('SELECT password_salt, password_hash FROM comments WHERE id = ?1 AND slug = ?2')
				.bind(input.id, slug)
				.first()
		: null;
	if (!row) return fail(404, 'comment not found');
	const allowed =
		(await hashPassword(password, row.password_salt)) === row.password_hash || (await isAdmin(password, env));
	if (!allowed) return fail(403, 'wrong password');
	await env.DB.prepare('DELETE FROM comments WHERE id = ?1').bind(input.id).run();
	return Response.json({ deleted: true }, { headers: noStore });
}

export async function onRequest({ request, params, env }) {
	const { method } = request;
	if (!['GET', 'POST', 'DELETE'].includes(method)) {
		return new Response(null, { status: 405, headers: { Allow: 'GET, POST, DELETE' } });
	}
	if (method !== 'GET' && !isSameOrigin(request)) return fail(403, 'forbidden');
	const { slug } = params;
	if (!(await postExists(request, env, slug))) return fail(404, 'not found');

	if (method === 'GET') {
		const { results } = await env.DB.prepare(
			'SELECT id, name, body, created_at AS createdAt FROM comments WHERE slug = ?1 ORDER BY created_at, id',
		)
			.bind(slug)
			.all();
		return Response.json({ comments: results }, { headers: noStore });
	}

	let input;
	try {
		input = await request.json();
	} catch {
		return fail(400, 'invalid JSON');
	}
	if (!input || typeof input !== 'object') return fail(400, 'invalid JSON');
	return method === 'POST' ? addComment(request, env, slug, input) : deleteComment(env, slug, input);
}
