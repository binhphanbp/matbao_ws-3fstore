import { BundleSaveSection } from "@/components/home/bundle-save-section";
import { PetStoreHero } from "@/components/home/pet-store-hero";
import { getFeaturedProducts } from "@/data/products";

export default function Home() {
  const featuredProducts = getFeaturedProducts(20);

  return (
    <>
      <PetStoreHero />
      <BundleSaveSection products={featuredProducts} />
    </>
  );
}
