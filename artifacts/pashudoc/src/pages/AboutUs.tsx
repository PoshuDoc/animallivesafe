import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function AboutUs() {
  const { data: sc = {} } = useSiteContent();
  const c = (key: string, fallback: string) => sc[key] || fallback;
  const html = (key: string, fallback: string) => sc[key] || fallback;

  return (
    <Layout>
      <section className="bg-primary/5 py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            {c("about_hero_badge", "আমাদের সম্পর্কে")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {c("about_hero_title", "পশুডক — কৃষকের পাশে থাকার প্রতিশ্রুতি")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {c("about_hero_subtitle", "বাংলাদেশের কোটি কৃষকের পশু সম্পদ রক্ষায় আমরা কাজ করছি।")}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6"
            dangerouslySetInnerHTML={{
              __html: html("page_about_content", "<p>আমাদের সম্পর্কে তথ্য শীঘ্রই যোগ করা হবে।</p>"),
            }}
          />
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {c("landing_cta_title", "আমাদের যাত্রায় যোগ দিন")}
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            {c("about_cta_desc", "কৃষক বা ডাক্তার — যেই হোন না কেন, পশুডকে আপনার স্বাগত।")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold" asChild>
              <Link href="/register">নিবন্ধন করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link href="/contact">যোগাযোগ করুন</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
