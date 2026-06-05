export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  accent?: string;
  image?: string | null;
  slug?: string;
  brand?: string;
};

export type ProductAudience = "cat" | "dog" | "both" | "all-pets";

export type ProductVariantOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  options: ProductVariantOption[];
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  sold: number;
};

export type StoreProduct = Product & {
  shopeeId: string;
  shortName: string;
  categoryPath: string[];
  audience: ProductAudience;
  compareAtPrice: number | null;
  priceRange: {
    min: number;
    max: number;
  };
  images: string[];
  shortDescription: string;
  description: string;
  sourceUrl: string;
  tags: string[];
  sold: number;
  variants: ProductVariant[];
};

export type ProductPreview = Pick<
  StoreProduct,
  | "id"
  | "slug"
  | "name"
  | "shortName"
  | "category"
  | "brand"
  | "price"
  | "compareAtPrice"
  | "priceRange"
  | "image"
  | "audience"
>;
