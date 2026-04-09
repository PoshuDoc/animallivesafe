import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function TermsOfUse() {
  const { data: sc = {} } = useSiteContent();
  const c = (key: string, fallback: string) => sc[key] || fallback;

  return (
    <Layout>
      <section className="bg-primary/5 py-16 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            আইনি তথ্য
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {c("terms_hero_title", "ব্যবহারের শর্তাবলী")}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {c("terms_hero_subtitle", "পশুডক ব্যবহার করার আগে অনুগ্রহ করে এই শর্তাবলী পড়ুন।")}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6"
            dangerouslySetInnerHTML={{
              __html: c("page_terms_content", "<p>শর্তাবলী শীঘ্রই যোগ করা হবে।</p>"),
            }}
          />
        </div>
      </section>
    </Layout>
  );
}
