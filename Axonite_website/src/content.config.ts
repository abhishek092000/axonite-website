import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tag: z.string(),
    excerpt: z.string(),
    image: z.string().optional(),
    video: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const careers = defineCollection({
  loader: glob({ base: "./src/content/careers", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    type: z.string(),
    experience: z.string().default(""),
    open: z.boolean().default(true),
  }),
});

export const collections = { blog, careers };
