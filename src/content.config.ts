import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in `src/content/blog/posts/`; images live in `../images/`.
	loader: glob({ base: './src/content/blog/posts', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// true keeps the post out of the site, RSS and sitemap.
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
