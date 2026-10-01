import { z } from "zod";
import { auth } from "@/lib/auth";
import { saveUploadedFile, readImageUpload } from "@/lib/fileStorage";
import { PRODUCT_TIERS, AD_PLACEMENTS, type ProductTierKey, type AdPlacementKey } from "@/lib/storeOptions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function requireAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN" ? session : null;
}

const httpsUrl = z
  .string()
  .trim()
  .url("Paste a full link starting with https://")
  .max(2000)
  .refine((u) => u.startsWith("https://"), "Links must start with https://");

// "#Yoga mats, cork" → ["yoga-mats", "cork"]
function parseTags(raw: string): string[] {
  const tags = raw
    .split(/[,\n]/)
    .map((t) => t.trim().replace(/^#+/, "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean)
    .map((t) => t.slice(0, 30));
  return [...new Set(tags)].slice(0, 10);
}

const ProductFields = z.object({
  name: z.string().trim().min(1, "Add a product name.").max(120),
  description: z.string().trim().max(500),
  retailer: z.string().trim().min(1, "Add the retailer's name.").max(60),
  url: httpsUrl,
  priceLabel: z.string().trim().max(30),
  tier: z.enum(Object.keys(PRODUCT_TIERS) as [ProductTierKey, ...ProductTierKey[]]),
  tags: z.string().max(400).transform(parseTags),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
  sortOrder: z.coerce.number().int().min(-1000).max(1000),
});

const PLACEMENT_MESSAGE = "Pick at least one place to show the ad.";

const AdFields = z.object({
  altText: z.string().trim().min(1, "Describe the ad in a few words.").max(120),
  linkUrl: httpsUrl,
  placements: z
    .array(z.enum(Object.keys(AD_PLACEMENTS) as [AdPlacementKey, ...AdPlacementKey[]]), { error: PLACEMENT_MESSAGE })
    .min(1, PLACEMENT_MESSAGE),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

/** Reads the fields present in the form (all of them when creating, any subset when updating). */
function formValues(formData: FormData, keys: string[], arrayKeys: string[] = []) {
  const values: Record<string, unknown> = {};
  for (const key of keys) {
    if (arrayKeys.includes(key)) {
      const all = formData.getAll(key);
      if (all.length > 0 || formData.has(`${key}_present`)) values[key] = all.map(String);
    } else if (formData.has(key)) {
      values[key] = String(formData.get(key));
    }
  }
  return values;
}

export function parseProductForm(formData: FormData) {
  return ProductFields.safeParse(formValues(formData, Object.keys(ProductFields.shape)));
}

export function parseProductUpdate(formData: FormData) {
  return ProductFields.partial().safeParse(formValues(formData, Object.keys(ProductFields.shape)));
}

export function parseAdForm(formData: FormData) {
  return AdFields.safeParse(formValues(formData, Object.keys(AdFields.shape), ["placements"]));
}

export function parseAdUpdate(formData: FormData) {
  return AdFields.partial().safeParse(formValues(formData, Object.keys(AdFields.shape), ["placements"]));
}

export function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  return issue?.message ?? "Invalid form.";
}

/** Saves an optional image from the form; returns undefined when none was attached. */
export async function saveFormImage(formData: FormData, subdir: string, ownerId: string) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { path: undefined };
  const image = await readImageUpload(file, MAX_IMAGE_BYTES);
  if ("error" in image) return { error: image.error };
  return { path: await saveUploadedFile(subdir, ownerId, `image.${image.ext}`, image.buffer) };
}
