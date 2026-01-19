import { z } from 'zod';

// Content schema

export const mediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  mime_type: z.string(),
  type: z.string(),
  url: z.string().url(),
  thumb_url: z.string().url(),
  is_video: z.boolean(),
  created_at: z.string(),
});
const ContentSchema = z.object({
  body: z.string(),
  media: z.array(mediaSchema),
  url: z.string(),
});

// TikTok options schema
const TikTokOptionsSchema = z.object({
  privacy_level: z.record(z.string(), z.string().nullable()),
  allow_comments: z.record(z.string(), z.boolean()),
  allow_duet: z.record(z.string(), z.boolean()),
  allow_stitch: z.record(z.string(), z.boolean()),
  content_disclosure: z.record(z.string(), z.boolean()),
  brand_organic_toggle: z.record(z.string(), z.boolean()),
  brand_content_toggle: z.record(z.string(), z.boolean()),
});

// YouTube options schema
const YouTubeOptionsSchema = z.object({
  title: z.string().nullable(),
  status: z.enum(['public', 'private', 'unlisted']),
});

// LinkedIn options schema
const LinkedInOptionsSchema = z.object({
  visibility: z.enum(['PUBLIC', 'CONNECTIONS', 'PRIVATE']),
});

// Mastodon options schema
const MastodonOptionsSchema = z.object({
  sensitive: z.boolean(),
});

// Instagram options schema
const InstagramOptionsSchema = z.object({
  type: z.enum(['post', 'story', 'reel']),
});

// Pinterest options schema
const PinterestOptionsSchema = z.object({
  title: z.string().nullable(),
  link: z.string().nullable(),
  boards: z.record(z.string(), z.string().nullable()),
});

// Facebook Page options schema
const FacebookPageOptionsSchema = z.object({
  type: z.enum(['post', 'story']),
});

// Options schema (all platforms)
const OptionsSchema = z.object({
  tiktok: TikTokOptionsSchema,
  youtube: YouTubeOptionsSchema,
  linkedin: LinkedInOptionsSchema,
  mastodon: MastodonOptionsSchema,
  instagram: InstagramOptionsSchema,
  pinterest: PinterestOptionsSchema,
  facebook_page: FacebookPageOptionsSchema,
});

// Version schema
const VersionSchema = z.object({
  account_id: z.number(),
  is_original: z.boolean(),
  content: z.array(ContentSchema),
  options: OptionsSchema,
});

// Tag schema
const TagSchema = z.object({
  id: z.number(),
  uuid: z.string().uuid(),
  name: z.string(),
  hex_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

// User schema
const UserSchema = z.object({
  name: z.string(),
});

// Main post schema
const PostSchema = z.object({
  id: z.number(),
  uuid: z.string().uuid(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']),
  accounts: z.array(z.unknown()),
  versions: z.array(VersionSchema),
  tags: z.array(TagSchema),
  user: UserSchema,
  scheduled_at: z.string().nullable(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  trashed: z.boolean(),
});

// API response schema
export const ApiResponseSchema = z.object({
  data: z.array(PostSchema),
});

// Type exports
export type Post = z.infer<typeof PostSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Usage example:
// const result = ApiResponseSchema.parse(responseData);
// or for validation without throwing:
// const result = ApiResponseSchema.safeParse(responseData);