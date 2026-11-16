// GET /api/views/:slug returns a post's view count; POST adds one view and returns the new count.
import { isSameOrigin, postExists } from '../../../server/blog.js';

export async function onRequest({ request, params, env }) {
	const { method } = request;
	if (method !== 'GET' && method !== 'POST') {
		return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
	}
	if (method === 'POST' && !isSameOrigin(request)) {
		return Response.json({ error: 'forbidden' }, { status: 403 });
	}
	const { slug } = params;
	if (!(await postExists(request, env, slug))) {
		return Response.json({ error: 'not found' }, { status: 404 });
	}

	const row =
		method === 'POST'
			? await env.DB.prepare(
					'INSERT INTO views (slug, count) VALUES (?1, 1) ON CONFLICT (slug) DO UPDATE SET count = count + 1 RETURNING count',
				)
					.bind(slug)
					.first()
			: await env.DB.prepare('SELECT count FROM views WHERE slug = ?1').bind(slug).first();
	return Response.json({ count: row?.count ?? 0 }, { headers: { 'Cache-Control': 'no-store' } });
}
