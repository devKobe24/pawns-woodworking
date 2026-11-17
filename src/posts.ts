import { getCollection } from 'astro:content';

// Newest first. Drafts appear only in `npm run dev`, never in a build.
export async function getPosts() {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

// Every tag with its post count, most used first.
export function countTags(posts: Awaited<ReturnType<typeof getPosts>>) {
	const counts = new Map<string, number>();
	for (const tag of posts.flatMap((post) => post.data.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'));
}
