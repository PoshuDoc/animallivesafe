import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function ContactUs() {
  const { toast } = useToast();
  const { data: sc = {} } = useSiteContent();
  const c = (key: string, fallback: string) => sc[key] || fallback;

  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast({ title: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    toast({ title: "বার্তা পাঠানো হয়েছে!", description: "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।" });
    setForm({ name: "", phone: "", subject: "", message: "" });
  };

  const contactCards = [
    {
      icon: Phone,
      title: "হেল্পলাইন",
      lines: [c("footer_phone", "০১৭০০-০০০০০০")],
      note: c("contact_helpline_note", "সকাল ৮টা — রাত ৮টা (সপ্তাহের ৭ দিন)"),
    },
    {
      icon: Mail,
      title: "ইমেইল",
      lines: [c("footer_email", "support@pashudoc.com")],
      note: "সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দেওয়া হয়",
    },
    {
      icon: MapPin,
      title: "অফিস ঠিকানা",
      lines: [c("footer_address", "ঢাকা, বাংলাদেশ")],
      note: "সরাসরি আসতে হলে আগে ফোন করুন",
    },
    {
      icon: Clock,
      title: "অফিসের সময়",
      lines: ["রবি — বৃহস্পতি: সকাল ৯টা — সন্ধ্যা ৬টা", "শুক্র — শনি: বন্ধ"],
      note: "ফোন সাপোর্ট সপ্তাহের ৭ দিন চালু থাকে",
    },
  ];

  return (
    <Layout>
      <section className="bg-primary/5 py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            {c("contact_hero_badge", "যোগাযোগ করুন")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {c("contact_hero_title", "আমরা আপনার পাশে আছি")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {c("contact_hero_subtitle", "যেকোনো সমস্যা, প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।")}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactCards.map(({ icon: Icon, title, lines, note }) => (
              <Card key={title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">{title}</h3>
                  </div>
                  <div className="space-y-1 mb-3">
                    {lines.map((line, i) => (
                      <p key={i} className="text-sm font-medium text-foreground">{line}</p>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">বার্তা পাঠান</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">আপনার নাম *</label>
                        <Input name="name" value={form.name} onChange={handleChange} placeholder="আপনার পূর্ণ নাম" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">মোবাইল নম্বর *</label>
                        <Input name="phone" value={form.phone} onChange={handleChange} placeholder="০১৭XXXXXXXX" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">বিষয়</label>
                      <Input name="subject" value={form.subject} onChange={handleChange} placeholder="বার্তার বিষয়" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">বার্তা *</label>
                      <Textarea name="message" value={form.message} onChange={handleChange} placeholder="আপনার বার্তা লিখুন..." rows={5} />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full h-11 font-semibold">
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2">জরুরি সাহায্য দরকার?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    আপনার পশুর অবস্থা গুরুতর হলে সরাসরি হেল্পলাইনে কল করুন। আমাদের বিশেষজ্ঞ দল সাথে সাথে সাহায্য করবে।
                  </p>
                  <a href={`tel:${c("footer_phone", "01700000000").replace(/[^0-9]/g, "")}`}>
                    <Button className="w-full h-11 font-semibold" data-testid="button-helpline">
                      <Phone className="mr-2 h-4 w-4" />
                      {c("footer_phone", "০১৭০০-০০০০০০")}
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {sc["page_contact_content"] && (
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div
                      className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: sc["page_contact_content"] }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
