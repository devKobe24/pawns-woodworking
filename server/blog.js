// Shared checks for the blog API in functions/.
const SLUG = /^[a-z0-9-]+$/;

// True when /blog/<slug>/ is a built page, so API rows exist only for real posts.
export async function postExists(request, env, slug) {
	if (!SLUG.test(slug)) return false;
	const page = await env.ASSETS.fetch(new URL(`/blog/${slug}/`, request.url));
	return page.ok;
}

// Writes must come from this site's own pages.
export function isSameOrigin(request) {
	return request.headers.get('Origin') === new URL(request.url).origin;
}

export function toHex(buffer) {
	return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Salted SHA-256 of the client IP, so rate limits work without storing addresses.
export async function hashIp(request, env) {
	const salt = await env.DB.prepare("SELECT value FROM secrets WHERE name = 'ip_salt'").first('value');
	if (!salt) throw new Error('ip_salt is missing; run the D1 migrations');
	const ip = request.headers.get('CF-Connecting-IP') ?? '';
	return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ip)));
}
