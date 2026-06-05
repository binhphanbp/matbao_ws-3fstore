import productsJson from "@/data/shopee-products.json";
import type { ProductPreview, StoreProduct } from "@/types/product";

export const storeProducts = productsJson as StoreProduct[];

export const productCategories = Array.from(
  new Set(storeProducts.map((product) => product.category)),
);

export function getFeaturedProducts(limit = 10): ProductPreview[] {
  const preferredCategories = [
    "Pate & thức ăn ướt",
    "Hạt & thức ăn khô",
    "Cát vệ sinh",
    "Snack & bánh thưởng",
    "Phụ kiện",
    "Chăm sóc & vệ sinh",
  ];

  const featured: StoreProduct[] = [];
  const usedIds = new Set<string>();

  for (const category of preferredCategories) {
    const product = storeProducts.find(
      (item) =>
        item.category === category && item.image && !usedIds.has(item.id),
    );

    if (product) {
      featured.push(product);
      usedIds.add(product.id);
    }
  }

  for (const product of storeProducts) {
    if (featured.length >= limit) {
      break;
    }

    if (product.image && !usedIds.has(product.id)) {
      featured.push(product);
      usedIds.add(product.id);
    }
  }

  return featured.slice(0, limit).map(toProductPreview);
}

export function getTrendingSnackProducts(limit = 6): ProductPreview[] {
  const usedIds = new Set<string>();
  const snackProducts = storeProducts.filter(
    (product) => product.category === "Snack & bánh thưởng" && product.image,
  );
  const supportProducts = storeProducts.filter((product) => {
    if (!product.image || product.category === "Snack & bánh thưởng") {
      return false;
    }

    const searchable =
      `${product.shortName} ${product.category} ${product.brand}`.toLowerCase();

    return (
      product.category === "Pate & thức ăn ướt" ||
      searchable.includes("snack") ||
      searchable.includes("bánh") ||
      searchable.includes("thưởng") ||
      searchable.includes("ciao") ||
      searchable.includes("nekko")
    );
  });

  return [...snackProducts, ...supportProducts]
    .filter((product) => {
      if (usedIds.has(product.id)) {
        return false;
      }

      usedIds.add(product.id);
      return true;
    })
    .slice(0, limit)
    .map(toProductPreview);
}

function toProductPreview(product: StoreProduct): ProductPreview {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortName: product.shortName,
    category: product.category,
    brand: product.brand,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    priceRange: product.priceRange,
    image: product.image,
    audience: product.audience,
  };
}
