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
