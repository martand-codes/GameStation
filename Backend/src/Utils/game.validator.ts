import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  genre: z.string().min(2, "Genre is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.array(z.string()).optional().default([]),
});

export const updateGameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100).optional(),
  genre: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
});

export const pricingSchema = z.object({
  isFree: z.boolean(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional().default("INR"),
}).refine((data) => {
  if (!data.isFree && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Price must be greater than 0 if the game is not free",
  path: ["price"],
});

export const discountSchema = z.object({
  percentage: z.number().min(1).max(100, "Discount cannot exceed 100%"),
  startsAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  endsAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
}).refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
  message: "endsAt must be after startsAt",
  path: ["endsAt"],
});

export const mediaSchema = z.object({
  coverImageUrl: z.string().url("Must be a valid URL").optional(),
  bannerImageUrl: z.string().url("Must be a valid URL").optional(),
});

export const versionSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (e.g. 1.0.0)"),
  downloadUrl: z.string().url().optional(),
  changelog: z.string().optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type VersionInput = z.infer<typeof versionSchema>;
