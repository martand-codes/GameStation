import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  genre: z.string().min(2, "Genre is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.array(z.string()).optional().default([]),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.number().min(0).optional(),
});

export const updateGameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100).optional(),
  genre: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
});

export const pricingSchema = z.object({
  id: z.string().optional(),
  editionName: z.string().optional().default("Standard Edition"),
  features: z.array(z.string()).optional().default([]),
  isFree: z.boolean().optional().default(false),
  price: z.number().min(0).optional().default(0),
  currency: z.string().length(3).optional().default("INR"),
});

export const editionSchema = z.object({
  editionName: z.string().min(1, "Edition name is required"),
  features: z.array(z.string()).optional().default([]),
  isFree: z.boolean().optional().default(false),
  price: z.number().min(0).optional().default(0),
  currency: z.string().length(3).optional().default("INR"),
});

export const discountSchema = z.object({
  pricingId: z.string().optional(),
  percentage: z.number().min(1).max(100, "Discount cannot exceed 100%"),
  startsAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
  endsAt: z.string().datetime({ message: "Invalid ISO datetime string" }),
}).refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
  message: "endsAt must be after startsAt",
  path: ["endsAt"],
});

export const mediaSchema = z.object({
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  bannerImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  screenshots: z.array(z.string()).optional().default([]),
  trailerUrl: z.string().optional().or(z.literal("")).nullable(),
});

export const requirementsSchema = z.object({
  minOs: z.string().optional().default("Windows 10 64-bit"),
  minCpu: z.string().optional().default("Intel Core i5-6600K / AMD Ryzen 5 1600"),
  minGpu: z.string().optional().default("NVIDIA GTX 1060 (6GB) / AMD RX 580"),
  minMem: z.string().optional().default("8 GB"),
  minStorage: z.string().optional().default("50 GB available space"),
  minNetwork: z.string().optional().default("Broadband Internet connection"),
  optOs: z.string().optional().default("Windows 11 64-bit"),
  optCpu: z.string().optional().default("Intel Core i7-12700 / AMD Ryzen 7 5800X"),
  optGpu: z.string().optional().default("NVIDIA RTX 3070 / AMD RX 6800 XT"),
  optMem: z.string().optional().default("16 GB"),
  optStorage: z.string().optional().default("70 GB SSD"),
  optNetwork: z.string().optional().default("High-speed Broadband"),
});

export const telemetrySchema = z.object({
  mainStoryHours: z.number().min(0).optional().nullable(),
  mainExtrasHours: z.number().min(0).optional().nullable(),
  completionistHours: z.number().min(0).optional().nullable(),
});

export const versionSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (e.g. 1.0.0)"),
  downloadUrl: z.string().optional().or(z.literal("")).nullable(),
  changelog: z.string().optional().nullable(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
export type EditionInput = z.infer<typeof editionSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type RequirementsInput = z.infer<typeof requirementsSchema>;
export type TelemetryInput = z.infer<typeof telemetrySchema>;
export type VersionInput = z.infer<typeof versionSchema>;
