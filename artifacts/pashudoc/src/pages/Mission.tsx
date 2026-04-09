import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { PAGE_DEFAULTS } from "@/lib/pageDefaults";

export default function Mission() {
  const { data: sc = {} } = useSiteContent();
  const c = (key: string, fallback: string) => sc[key] || fallback;

  return (
    <Layout>
      <section className="bg-primary/5 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            {c("mission_hero_badge", "আমাদের মিশন")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {c("mission_hero_title", "বাংলাদেশের প্রতিটি পশুর জন্য সঠিক চিকিৎসা নিশ্চিত করা")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {c("mission_hero_subtitle", "কোটি কৃষকের পশু সম্পদ রক্ষায় ডিজিটাল প্রযুক্তিকে কাজে লাগিয়ে সহজলভ্য পশু স্বাস্থ্যসেবা ব্যবস্থা গড়ে তোলা।")}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6"
            dangerouslySetInnerHTML={{
              __html: c("page_mission_content", PAGE_DEFAULTS.mission),
            }}
          />
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {c("landing_cta_title", "আজই শুরু করুন")}
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            {c("landing_cta_desc", "আমাদের যাত্রায় যোগ দিন।")}
          </p>
          <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold" asChild>
            <Link href="/register">নিবন্ধন করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
