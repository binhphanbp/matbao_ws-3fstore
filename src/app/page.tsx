import { BundleSaveSection } from "@/components/home/bundle-save-section";
import { ImmersiveCommerceSections } from "@/components/home/immersive-commerce-sections";
import { PetStoreHero } from "@/components/home/pet-store-hero";
import { TrendingSnacksSection } from "@/components/home/trending-snacks-section";
import { getFeaturedProducts, getTrendingSnackProducts } from "@/data/products";

export default function Home() {
  const featuredProducts = getFeaturedProducts(24);
  const trendingSnackProducts = getTrendingSnackProducts(6);

  return (
    <>
      <PetStoreHero />
      <BundleSaveSection products={featuredProducts} />
      <TrendingSnacksSection products={trendingSnackProducts} />
      <ImmersiveCommerceSections products={featuredProducts} />
    </>
  );
}
