import { getCollection } from 'astro:content';

// Newest first. Drafts appear only in `npm run dev`, never in a build.
export async function getPosts() {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
