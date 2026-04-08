import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "হেল্পলাইন",
    lines: ["01700-000000", "01711-000000"],
    note: "সকাল ৮টা — রাত ৮টা (সপ্তাহের ৭ দিন)",
  },
  {
    icon: Mail,
    title: "ইমেইল",
    lines: ["support@pashudoc.com.bd", "info@pashudoc.com.bd"],
    note: "সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দেওয়া হয়",
  },
  {
    icon: MapPin,
    title: "অফিস ঠিকানা",
    lines: ["হাউস ৫, রোড ১২, ধানমন্ডি", "ঢাকা — ১২০৯, বাংলাদেশ"],
    note: "সরাসরি আসতে হলে আগে ফোন করুন",
  },
  {
    icon: Clock,
    title: "অফিসের সময়",
    lines: ["রবি — বৃহস্পতি: সকাল ৯টা — সন্ধ্যা ৬টা", "শুক্র — শনি: বন্ধ"],
    note: "ফোন সাপোর্ট সপ্তাহের ৭ দিন চালু থাকে",
  },
];

export default function ContactUs() {
  const { toast } = useToast();
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

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary/5 py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            যোগাযোগ করুন
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            আমরা আপনার <span className="text-primary">পাশে আছি</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            যেকোনো সমস্যা, প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় সাহায্য করতে প্রস্তুত।
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map(({ icon: Icon, title, lines, note }) => (
              <Card key={title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">{title}</h3>
                  </div>
                  <div className="space-y-1 mb-3">
                    {lines.map(line => (
                      <p key={line} className="text-sm font-medium text-foreground">{line}</p>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Contact Form + Map Area */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">বার্তা পাঠান</h2>
                      <p className="text-muted-foreground text-sm">সরাসরি আমাদের টিমকে জানান</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">আপনার নাম *</label>
                        <Input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="মো. আব্দুল করিম"
                          className="h-11"
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">মোবাইল নম্বর *</label>
                        <Input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="01XXXXXXXXX"
                          className="h-11"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">বিষয়</label>
                      <Input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="আপনার সমস্যা বা প্রশ্নের বিষয়"
                        className="h-11"
                        data-testid="input-subject"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">বার্তা *</label>
                      <Textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="আপনার বিস্তারিত সমস্যা বা প্রশ্ন লিখুন..."
                        className="min-h-[140px] resize-none"
                        data-testid="input-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 font-semibold hover-elevate"
                      disabled={submitting}
                      data-testid="button-submit"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* FAQ quick links + social */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">দ্রুত সাহায্য পান</h3>
                  <div className="space-y-3">
                    {[
                      "ডাক্তার কীভাবে খুঁজব?",
                      "অ্যাপয়েন্টমেন্ট কীভাবে নেব?",
                      "ডাক্তার হিসেবে যোগ দেব কীভাবে?",
                      "অ্যাকাউন্ট সংক্রান্ত সমস্যা",
                      "পেমেন্ট বা ফি সংক্রান্ত প্রশ্ন",
                    ].map(item => (
                      <button
                        key={item}
                        className="w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors py-2.5 border-b border-border/50 last:border-0"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2">জরুরি সাহায্য দরকার?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    আপনার পশুর অবস্থা গুরুতর হলে সরাসরি হেল্পলাইনে কল করুন। আমাদের বিশেষজ্ঞ দল আপনাকে সাথে সাথে সাহায্য করবে।
                  </p>
                  <a href="tel:01700000000">
                    <Button className="w-full h-11 font-semibold hover-elevate" data-testid="button-helpline">
                      <Phone className="mr-2 h-4 w-4" />
                      01700-000000
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
