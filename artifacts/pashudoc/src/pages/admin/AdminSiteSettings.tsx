import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Navigation, Layout, FileText, Globe, Save } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiFetch(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("pashudoc_token");
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  }).then(r => r.json());
}

const DEFAULTS: Record<string, string> = {
  navbar_brand_name: "পশুডক",
  navbar_link_home: "হোম",
  navbar_link_doctors: "ডাক্তার খুঁজুন",
  navbar_link_login: "লগইন",
  navbar_link_register: "রেজিস্টার",
  footer_tagline: "বাংলাদেশের কৃষকদের জন্য বিশ্বস্ত পশু চিকিৎসক খোঁজার প্ল্যাটফর্ম",
  footer_phone: "০১৭০০-০০০০০০",
  footer_email: "support@pashudoc.com",
  footer_address: "ঢাকা, বাংলাদেশ",
  footer_copyright: "© ২০২৫ পশুডক। সর্বস্বত্ব সংরক্ষিত।",
  landing_hero_badge: "বাংলাদেশের কৃষকদের আস্থার প্রতীক",
  landing_hero_title: "আপনার গবাদি পশুর জন্য সেরা ডাক্তার খুঁজুন",
  landing_hero_subtitle: "ঘরে বসেই আপনার জেলার অভিজ্ঞ ভেটেরিনারি ডাক্তারদের খুঁজুন এবং অ্যাপয়েন্টমেন্ট বুক করুন।",
  landing_featured_title: "বিশেষজ্ঞ ডাক্তারগণ",
  landing_featured_subtitle: "আমাদের প্ল্যাটফর্মের সেরা রেটিং প্রাপ্ত ডাক্তাররা",
  landing_how_title: "কীভাবে কাজ করে?",
  landing_how_subtitle: "খুব সহজেই মাত্র ৩টি ধাপে আপনার গবাদি পশুর চিকিৎসা নিশ্চিত করুন",
  landing_step1_title: "১. ডাক্তার খুঁজুন",
  landing_step1_desc: "আপনার জেলা এবং পশুর ধরন অনুযায়ী অভিজ্ঞ ডাক্তার খুঁজুন",
  landing_step2_title: "২. বুক করুন",
  landing_step2_desc: "আপনার সুবিধামতো সময় ও তারিখ নির্বাচন করে অ্যাপয়েন্টমেন্ট নিন",
  landing_step3_title: "৩. চিকিৎসা নিন",
  landing_step3_desc: "নির্ধারিত সময়ে ডাক্তারের সাথে দেখা করুন বা ফোনে কথা বলুন",
  landing_faq_badge: "সাধারণ প্রশ্ন",
  landing_faq_title: "প্রায়ই জিজ্ঞাসিত প্রশ্নসমূহ",
  landing_faq_subtitle: "পশুডক সম্পর্কে আপনার মনে যা প্রশ্ন আসতে পারে",
  landing_cta_title: "আজই শুরু করুন — আপনার পশুর সুস্বাস্থ্য নিশ্চিত করুন",
  landing_cta_desc: "হাজার হাজার কৃষক ইতিমধ্যেই পশুডক ব্যবহার করে তাদের গবাদি পশুর সঠিক চিকিৎসা নিশ্চিত করছেন। আপনিও যোগ দিন।",
  landing_stats_doctors: "৫০০+",
  landing_stats_districts: "৬৪",
  landing_stats_farmers: "১০,০০০+",
  page_about_content: "<h2>আমাদের সম্পর্কে</h2><p>পশুডক বাংলাদেশের কৃষকদের জন্য একটি বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম যা সারা দেশের অভিজ্ঞ ভেটেরিনারি চিকিৎসকদের সাথে সংযুক্ত করে।</p>",
  page_contact_content: "<h2>যোগাযোগ করুন</h2><p>আমাদের সাথে যোগাযোগ করতে নিচের তথ্য ব্যবহার করুন।</p>",
  page_privacy_content: "<h2>গোপনীয়তা নীতি</h2><p>আপনার ব্যক্তিগত তথ্য আমাদের কাছে সুরক্ষিত।</p>",
  page_terms_content: "<h2>ব্যবহারের শর্তাবলী</h2><p>পশুডক ব্যবহার করে আপনি এই শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।</p>",
  page_mission_content: "<h2>আমাদের লক্ষ্য</h2><p>বাংলাদেশের প্রতিটি কৃষকের কাছে মানসম্পন্ন পশু চিকিৎসা সেবা পৌঁছে দেওয়া।</p>",
};

export function AdminSiteSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedContent, isLoading, isFetched } = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: () => apiFetch("/api/admin/site-content"),
  });

  const [content, setContent] = useState<Record<string, string>>(() => ({ ...DEFAULTS }));

  useEffect(() => {
    if (isFetched) {
      setContent({ ...DEFAULTS, ...(savedContent ?? {}) });
    }
  }, [savedContent, isFetched]);

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      await Promise.all(
        Object.entries(updates).map(([key, value]) =>
          apiFetch(`/api/admin/site-content/${key}`, { method: "PUT", body: JSON.stringify({ value }) })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      toast({ title: "সফল", description: "সাইট কন্টেন্ট সংরক্ষিত হয়েছে" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "ত্রুটি", description: "সংরক্ষণ করা যায়নি" });
    },
  });

  const set = (key: string, value: string) => setContent(prev => ({ ...prev, [key]: value }));

  const saveSection = (keys: string[]) => {
    const updates = Object.fromEntries(keys.map(k => [k, content[k] ?? ""]));
    saveMutation.mutate(updates);
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> সাইট সেটিং
        </h2>
        <p className="text-sm text-muted-foreground">সাইটের সকল কন্টেন্ট এখান থেকে সম্পাদনা করুন</p>
      </div>

      <Tabs defaultValue="navbar">
        <TabsList className="h-auto bg-muted/50 flex-wrap gap-1 p-1">
          {[
            { value: "navbar", icon: Navigation, label: "নেভবার" },
            { value: "footer", icon: Layout, label: "ফুটার" },
            { value: "landing", icon: Globe, label: "হোমপেজ" },
            { value: "pages", icon: FileText, label: "পেজ কন্টেন্ট" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm">
              <Icon className="h-4 w-4 mr-1.5" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── Navbar ──────────────────────────────────────── */}
        <TabsContent value="navbar" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">নেভবার সম্পাদনা</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="ব্র্যান্ড নাম" value={content.navbar_brand_name ?? ""} onChange={v => set("navbar_brand_name", v)} />
                <Field label="হোম লিঙ্কের লেখা" value={content.navbar_link_home ?? ""} onChange={v => set("navbar_link_home", v)} />
                <Field label="ডাক্তার খোঁজা লিঙ্কের লেখা" value={content.navbar_link_doctors ?? ""} onChange={v => set("navbar_link_doctors", v)} />
                <Field label="লগইন বাটনের লেখা" value={content.navbar_link_login ?? ""} onChange={v => set("navbar_link_login", v)} />
                <Field label="রেজিস্টার বাটনের লেখা" value={content.navbar_link_register ?? ""} onChange={v => set("navbar_link_register", v)} />
              </div>
              <SaveButton onClick={() => saveSection(["navbar_brand_name","navbar_link_home","navbar_link_doctors","navbar_link_login","navbar_link_register"])} loading={saveMutation.isPending} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Footer ──────────────────────────────────────── */}
        <TabsContent value="footer" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">ফুটার সম্পাদনা</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="ট্যাগলাইন" value={content.footer_tagline ?? ""} onChange={v => set("footer_tagline", v)} />
                </div>
                <Field label="ফোন নম্বর" value={content.footer_phone ?? ""} onChange={v => set("footer_phone", v)} />
                <Field label="ইমেইল" value={content.footer_email ?? ""} onChange={v => set("footer_email", v)} />
                <Field label="ঠিকানা" value={content.footer_address ?? ""} onChange={v => set("footer_address", v)} />
                <Field label="কপিরাইট লেখা" value={content.footer_copyright ?? ""} onChange={v => set("footer_copyright", v)} />
              </div>
              <SaveButton onClick={() => saveSection(["footer_tagline","footer_phone","footer_email","footer_address","footer_copyright"])} loading={saveMutation.isPending} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Landing Page ────────────────────────────────── */}
        <TabsContent value="landing" className="mt-4">
          <div className="space-y-4">
            {/* Hero */}
            <Card>
              <CardHeader><CardTitle className="text-base">হিরো সেকশন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="ব্যাজ টেক্সট" value={content.landing_hero_badge ?? ""} onChange={v => set("landing_hero_badge", v)} />
                <Field label="হিরো শিরোনাম" value={content.landing_hero_title ?? ""} onChange={v => set("landing_hero_title", v)} />
                <Field label="হিরো সাবটাইটেল" value={content.landing_hero_subtitle ?? ""} onChange={v => set("landing_hero_subtitle", v)} />
                <SaveButton onClick={() => saveSection(["landing_hero_badge","landing_hero_title","landing_hero_subtitle"])} loading={saveMutation.isPending} />
              </CardContent>
            </Card>

            {/* Featured Doctors */}
            <Card>
              <CardHeader><CardTitle className="text-base">বিশেষজ্ঞ ডাক্তার সেকশন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="শিরোনাম" value={content.landing_featured_title ?? ""} onChange={v => set("landing_featured_title", v)} />
                <Field label="সাবটাইটেল" value={content.landing_featured_subtitle ?? ""} onChange={v => set("landing_featured_subtitle", v)} />
                <SaveButton onClick={() => saveSection(["landing_featured_title","landing_featured_subtitle"])} loading={saveMutation.isPending} />
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader><CardTitle className="text-base">কীভাবে কাজ করে সেকশন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="শিরোনাম" value={content.landing_how_title ?? ""} onChange={v => set("landing_how_title", v)} />
                <Field label="সাবটাইটেল" value={content.landing_how_subtitle ?? ""} onChange={v => set("landing_how_subtitle", v)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/30">
                  <p className="sm:col-span-2 text-xs font-semibold text-muted-foreground">ধাপ ১</p>
                  <Field label="ধাপ ১ শিরোনাম" value={content.landing_step1_title ?? ""} onChange={v => set("landing_step1_title", v)} />
                  <Field label="ধাপ ১ বিবরণ" value={content.landing_step1_desc ?? ""} onChange={v => set("landing_step1_desc", v)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/30">
                  <p className="sm:col-span-2 text-xs font-semibold text-muted-foreground">ধাপ ২</p>
                  <Field label="ধাপ ২ শিরোনাম" value={content.landing_step2_title ?? ""} onChange={v => set("landing_step2_title", v)} />
                  <Field label="ধাপ ২ বিবরণ" value={content.landing_step2_desc ?? ""} onChange={v => set("landing_step2_desc", v)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/30">
                  <p className="sm:col-span-2 text-xs font-semibold text-muted-foreground">ধাপ ৩</p>
                  <Field label="ধাপ ৩ শিরোনাম" value={content.landing_step3_title ?? ""} onChange={v => set("landing_step3_title", v)} />
                  <Field label="ধাপ ৩ বিবরণ" value={content.landing_step3_desc ?? ""} onChange={v => set("landing_step3_desc", v)} />
                </div>
                <SaveButton onClick={() => saveSection(["landing_how_title","landing_how_subtitle","landing_step1_title","landing_step1_desc","landing_step2_title","landing_step2_desc","landing_step3_title","landing_step3_desc"])} loading={saveMutation.isPending} />
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader><CardTitle className="text-base">FAQ সেকশন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="ব্যাজ টেক্সট" value={content.landing_faq_badge ?? ""} onChange={v => set("landing_faq_badge", v)} />
                <Field label="শিরোনাম" value={content.landing_faq_title ?? ""} onChange={v => set("landing_faq_title", v)} />
                <Field label="সাবটাইটেল" value={content.landing_faq_subtitle ?? ""} onChange={v => set("landing_faq_subtitle", v)} />
                <SaveButton onClick={() => saveSection(["landing_faq_badge","landing_faq_title","landing_faq_subtitle"])} loading={saveMutation.isPending} />
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader><CardTitle className="text-base">পরিসংখ্যান সেকশন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="ডাক্তারের সংখ্যা" value={content.landing_stats_doctors ?? ""} onChange={v => set("landing_stats_doctors", v)} />
                  <Field label="জেলার সংখ্যা" value={content.landing_stats_districts ?? ""} onChange={v => set("landing_stats_districts", v)} />
                  <Field label="কৃষকের সংখ্যা" value={content.landing_stats_farmers ?? ""} onChange={v => set("landing_stats_farmers", v)} />
                </div>
                <SaveButton onClick={() => saveSection(["landing_stats_doctors","landing_stats_districts","landing_stats_farmers"])} loading={saveMutation.isPending} />
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardHeader><CardTitle className="text-base">CTA সেকশন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="CTA শিরোনাম" value={content.landing_cta_title ?? ""} onChange={v => set("landing_cta_title", v)} />
                <Field label="CTA বিবরণ" value={content.landing_cta_desc ?? ""} onChange={v => set("landing_cta_desc", v)} />
                <SaveButton onClick={() => saveSection(["landing_cta_title","landing_cta_desc"])} loading={saveMutation.isPending} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Public Pages ────────────────────────────────── */}
        <TabsContent value="pages" className="mt-4">
          <Tabs defaultValue="about">
            <TabsList className="h-auto bg-muted/50 flex-wrap gap-1 p-1 mb-4">
              {[
                { value: "about", label: "আমাদের সম্পর্কে" },
                { value: "contact", label: "যোগাযোগ" },
                { value: "privacy", label: "গোপনীয়তা নীতি" },
                { value: "terms", label: "শর্তাবলী" },
                { value: "mission", label: "আমাদের লক্ষ্য" },
              ].map(({ value, label }) => (
                <TabsTrigger key={value} value={value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-sm">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {[
              { value: "about", key: "page_about_content", label: "আমাদের সম্পর্কে" },
              { value: "contact", key: "page_contact_content", label: "যোগাযোগ পেজ" },
              { value: "privacy", key: "page_privacy_content", label: "গোপনীয়তা নীতি" },
              { value: "terms", key: "page_terms_content", label: "শর্তাবলী পেজ" },
              { value: "mission", key: "page_mission_content", label: "আমাদের লক্ষ্য পেজ" },
            ].map(({ value, key, label }) => (
              <TabsContent key={value} value={value}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{label} — সম্পাদনা</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">TipTap রিচ টেক্সট এডিটর দিয়ে কন্টেন্ট সম্পাদনা করুন</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RichTextEditor
                      key={isFetched ? `loaded-${key}` : `empty-${key}`}
                      value={content[key] ?? ""}
                      onChange={v => set(key, v)}
                    />
                    <SaveButton onClick={() => saveSection([key])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button onClick={onClick} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2">
      <Save className="h-4 w-4" />
      {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
    </Button>
  );
}
