import { supabase } from "@/lib/supabase";
import PublicPortfolio from "@/app/components/portfolio/PublicPortfolio";
import { notFound } from "next/navigation";

export default async function PublicPortfolioPage({ params }) {
  const { slug } = await params;

  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !portfolio) {
    notFound();
  }

  return <PublicPortfolio portfolio={portfolio} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("title, content")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!portfolio) {
    return { title: "Portfolio Not Found" };
  }

  const fullName = portfolio.content?.personalInfo?.fullName || portfolio.title;
  const tagline = portfolio.content?.personalInfo?.tagline || "";

  return {
    title: `${fullName} | ForgeCV Portfolio`,
    description: tagline || `View ${fullName}'s professional portfolio.`,
  };
}
