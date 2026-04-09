import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Navigation, Layout, FileText, Globe, Save, Plus, Trash2, ExternalLink, Megaphone } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { PAGE_DEFAULTS } from "@/lib/pageDefaults";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiFetch(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("pashudoc_token");
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  }).then(r => r.json());
}

const DEFAULT_SOCIAL_LINKS = JSON.stringify([
  { platform: "facebook", url: "https://facebook.com/pashudoc", label: "ফেসবুক" },
  { platform: "youtube", url: "https://youtube.com/pashudoc", label: "ইউটিউব" },
]);

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
  footer_social_links: DEFAULT_SOCIAL_LINKS,
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
  about_hero_badge: "আমাদের সম্পর্কে",
  about_hero_title: "পশুডক — কৃষকের পাশে থাকার প্রতিশ্রুতি",
  about_hero_subtitle: "বাংলাদেশের কোটি কৃষকের পশু সম্পদ রক্ষায় আমরা কাজ করছি।",
  page_about_content: PAGE_DEFAULTS.about,
  contact_hero_badge: "যোগাযোগ করুন",
  contact_hero_title: "আমরা আপনার পাশে আছি",
  contact_hero_subtitle: "যেকোনো সমস্যা, প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।",
  contact_helpline_note: "সকাল ৮টা — রাত ৮টা (সপ্তাহের ৭ দিন)",
  page_contact_content: "",
  mission_hero_badge: "আমাদের মিশন",
  mission_hero_title: "বাংলাদেশের প্রতিটি পশুর জন্য সঠিক চিকিৎসা নিশ্চিত করা",
  mission_hero_subtitle: "কোটি কৃষকের পশু সম্পদ রক্ষায় ডিজিটাল প্রযুক্তিকে কাজে লাগিয়ে সহজলভ্য সেবা গড়ে তোলা।",
  page_mission_content: PAGE_DEFAULTS.mission,
  privacy_hero_title: "গোপনীয়তা নীতি",
  privacy_hero_subtitle: "পশুডক আপনার গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়।",
  page_privacy_content: PAGE_DEFAULTS.privacy,
  terms_hero_title: "ব্যবহারের শর্তাবলী",
  terms_hero_subtitle: "পশুডক ব্যবহার করার আগে অনুগ্রহ করে এই শর্তাবলী পড়ুন।",
  page_terms_content: PAGE_DEFAULTS.terms,
  adsense_publisher_id: "",
  adsense_enabled: "false",
};

type SocialLink = { platform: string; url: string; label: string };

const PLATFORM_OPTIONS = [
  { value: "facebook", label: "ফেসবুক" },
  { value: "youtube", label: "ইউটিউব" },
  { value: "twitter", label: "টুইটার / X" },
  { value: "instagram", label: "ইনস্টাগ্রাম" },
  { value: "linkedin", label: "লিংকডইন" },
  { value: "whatsapp", label: "হোয়াটসঅ্যাপ" },
];

export function AdminSiteSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedContent, isLoading, isFetched } = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: () => apiFetch("/api/admin/site-content"),
    staleTime: 0,
  });

  const [content, setContent] = useState<Record<string, string>>(() => ({ ...DEFAULTS }));
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    try { return JSON.parse(DEFAULT_SOCIAL_LINKS); } catch { return []; }
  });

  useEffect(() => {
    if (isFetched) {
      const merged = { ...DEFAULTS };
      for (const [k, v] of Object.entries(savedContent ?? {})) {
        if (v !== "" && v !== null && v !== undefined) merged[k] = v as string;
      }
      setContent(merged);
      try {
        const raw = merged.footer_social_links;
        if (raw) setSocialLinks(JSON.parse(raw));
      } catch {
        // keep default
      }
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
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
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

  const saveSocialLinks = () => {
    const value = JSON.stringify(socialLinks);
    setContent(prev => ({ ...prev, footer_social_links: value }));
    saveMutation.mutate({ footer_social_links: value });
  };

  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { platform: "facebook", url: "", label: "ফেসবুক" }]);
  };

  const updateSocialLink = (idx: number, field: keyof SocialLink, value: string) => {
    setSocialLinks(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "platform") {
        const opt = PLATFORM_OPTIONS.find(o => o.value === value);
        if (opt) next[idx].label = opt.label;
      }
      return next;
    });
  };

  const removeSocialLink = (idx: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== idx));
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
            { value: "adsense", icon: Megaphone, label: "AdSense" },
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
          <div className="space-y-4">
            {/* Basic Info */}
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

            {/* Social Links */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">সোশ্যাল মিডিয়া লিঙ্ক</CardTitle>
                  <Button size="sm" variant="outline" onClick={addSocialLink} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> নতুন যোগ করুন
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialLinks.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                    কোনো সোশ্যাল লিঙ্ক নেই। উপরের বাটন থেকে যোগ করুন।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {socialLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 border rounded-lg bg-muted/20">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">প্ল্যাটফর্ম</Label>
                            <select
                              value={link.platform}
                              onChange={e => updateSocialLink(idx, "platform", e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              {PLATFORM_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs text-muted-foreground">লিঙ্ক (URL)</Label>
                            <div className="flex gap-2">
                              <Input
                                value={link.url}
                                onChange={e => updateSocialLink(idx, "url", e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="text-sm flex-1"
                              />
                              {link.url && (
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center px-2 text-muted-foreground hover:text-primary">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5"
                          onClick={() => removeSocialLink(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <SaveButton onClick={saveSocialLinks} loading={saveMutation.isPending} />
              </CardContent>
            </Card>
          </div>
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

            {/* About */}
            <TabsContent value="about">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">হিরো সেকশন — আমাদের সম্পর্কে</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="ব্যাজ" value={content.about_hero_badge ?? ""} onChange={v => set("about_hero_badge", v)} />
                    <Field label="পেজ শিরোনাম" value={content.about_hero_title ?? ""} onChange={v => set("about_hero_title", v)} />
                    <Field label="সাবটাইটেল" value={content.about_hero_subtitle ?? ""} onChange={v => set("about_hero_subtitle", v)} />
                    <SaveButton onClick={() => saveSection(["about_hero_badge","about_hero_title","about_hero_subtitle"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">মূল কন্টেন্ট</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <RichTextEditor key={isFetched ? "loaded-about" : "empty-about"} value={content.page_about_content ?? ""} onChange={v => set("page_about_content", v)} />
                    <SaveButton onClick={() => saveSection(["page_about_content"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact */}
            <TabsContent value="contact">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">হিরো সেকশন — যোগাযোগ</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="ব্যাজ" value={content.contact_hero_badge ?? ""} onChange={v => set("contact_hero_badge", v)} />
                    <Field label="পেজ শিরোনাম" value={content.contact_hero_title ?? ""} onChange={v => set("contact_hero_title", v)} />
                    <Field label="সাবটাইটেল" value={content.contact_hero_subtitle ?? ""} onChange={v => set("contact_hero_subtitle", v)} />
                    <Field label="হেল্পলাইন নোট" value={content.contact_helpline_note ?? ""} onChange={v => set("contact_helpline_note", v)} />
                    <SaveButton onClick={() => saveSection(["contact_hero_badge","contact_hero_title","contact_hero_subtitle","contact_helpline_note"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">অতিরিক্ত কন্টেন্ট (ঐচ্ছিক)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <RichTextEditor key={isFetched ? "loaded-contact" : "empty-contact"} value={content.page_contact_content ?? ""} onChange={v => set("page_contact_content", v)} />
                    <SaveButton onClick={() => saveSection(["page_contact_content"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Mission */}
            <TabsContent value="mission">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">হিরো সেকশন — মিশন</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="ব্যাজ" value={content.mission_hero_badge ?? ""} onChange={v => set("mission_hero_badge", v)} />
                    <Field label="পেজ শিরোনাম" value={content.mission_hero_title ?? ""} onChange={v => set("mission_hero_title", v)} />
                    <Field label="সাবটাইটেল" value={content.mission_hero_subtitle ?? ""} onChange={v => set("mission_hero_subtitle", v)} />
                    <SaveButton onClick={() => saveSection(["mission_hero_badge","mission_hero_title","mission_hero_subtitle"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">মূল কন্টেন্ট</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <RichTextEditor key={isFetched ? "loaded-mission" : "empty-mission"} value={content.page_mission_content ?? ""} onChange={v => set("page_mission_content", v)} />
                    <SaveButton onClick={() => saveSection(["page_mission_content"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy */}
            <TabsContent value="privacy">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">হিরো সেকশন — গোপনীয়তা নীতি</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="পেজ শিরোনাম" value={content.privacy_hero_title ?? ""} onChange={v => set("privacy_hero_title", v)} />
                    <Field label="সাবটাইটেল" value={content.privacy_hero_subtitle ?? ""} onChange={v => set("privacy_hero_subtitle", v)} />
                    <SaveButton onClick={() => saveSection(["privacy_hero_title","privacy_hero_subtitle"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">মূল কন্টেন্ট</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <RichTextEditor key={isFetched ? "loaded-privacy" : "empty-privacy"} value={content.page_privacy_content ?? ""} onChange={v => set("page_privacy_content", v)} />
                    <SaveButton onClick={() => saveSection(["page_privacy_content"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Terms */}
            <TabsContent value="terms">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">হিরো সেকশন — শর্তাবলী</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="পেজ শিরোনাম" value={content.terms_hero_title ?? ""} onChange={v => set("terms_hero_title", v)} />
                    <Field label="সাবটাইটেল" value={content.terms_hero_subtitle ?? ""} onChange={v => set("terms_hero_subtitle", v)} />
                    <SaveButton onClick={() => saveSection(["terms_hero_title","terms_hero_subtitle"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">মূল কন্টেন্ট</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <RichTextEditor key={isFetched ? "loaded-terms" : "empty-terms"} value={content.page_terms_content ?? ""} onChange={v => set("page_terms_content", v)} />
                    <SaveButton onClick={() => saveSection(["page_terms_content"])} loading={saveMutation.isPending} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ─── AdSense ─────────────────────────────────── */}
        <TabsContent value="adsense" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Google AdSense সেটিং
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
                  <p className="text-sm font-medium text-amber-800">AdSense apply করার ধাপ:</p>
                  <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>সাইট live করুন (Vercel-এ deploy করুন)</li>
                    <li><a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-1">adsense.google.com <ExternalLink className="h-3 w-3" /></a> — এ যান এবং সাইটের URL দিয়ে apply করুন</li>
                    <li>Google আপনার site review করবে (৩–১৪ দিন)</li>
                    <li>Approval পেলে Publisher ID (pub-XXXXXXXXXX) নিচে paste করুন</li>
                    <li>Enable করুন — AdSense script স্বয়ংক্রিয়ভাবে সাইটে যোগ হবে</li>
                  </ol>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-800">ads.txt ফাইল (অবশ্যই করতে হবে):</p>
                  <p className="text-sm text-blue-700">Approval পাওয়ার পর <code className="bg-blue-100 px-1 rounded text-xs font-mono">public/ads.txt</code> ফাইলে নিচের লাইন যোগ করুন:</p>
                  <div className="bg-blue-900 text-blue-100 rounded p-2 text-xs font-mono">
                    google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
                  </div>
                  <p className="text-xs text-blue-600">(pub-XXXXXXXXXX এর জায়গায় আপনার আসল Publisher ID বসান)</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Publisher ID (pub-XXXXXXXXXXXXXXXX)</Label>
                    <Input
                      value={content.adsense_publisher_id ?? ""}
                      onChange={e => set("adsense_publisher_id", e.target.value)}
                      placeholder="pub-1234567890123456"
                      className="text-sm font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Google AdSense dashboard থেকে Publisher ID কপি করুন</p>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <input
                      type="checkbox"
                      id="adsense-enabled"
                      checked={content.adsense_enabled === "true"}
                      onChange={e => set("adsense_enabled", e.target.checked ? "true" : "false")}
                      className="h-4 w-4 accent-primary"
                    />
                    <div>
                      <label htmlFor="adsense-enabled" className="text-sm font-medium cursor-pointer">AdSense সক্রিয় করুন</label>
                      <p className="text-xs text-muted-foreground">Publisher ID দেওয়ার পর এটি চালু করুন</p>
                    </div>
                  </div>

                  <SaveButton onClick={() => saveSection(["adsense_publisher_id", "adsense_enabled"])} loading={saveMutation.isPending} />
                </div>

                <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
                  <p className="text-sm font-medium text-green-800">Approval পেতে সাইটে যা থাকা জরুরি:</p>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>মৌলিক বাংলা কন্টেন্ট (কপি করা নয়)</li>
                    <li>গোপনীয়তা নীতি পেজ (আছে)</li>
                    <li>যোগাযোগ পেজ (আছে)</li>
                    <li>কমপক্ষে ৩–৬ মাসের পুরনো ডোমেইন (ভারত/বাংলাদেশের জন্য)</li>
                    <li>পর্যাপ্ত মৌলিক কন্টেন্ট ও নিয়মিত ব্যবহারকারী</li>
                    <li>প্রতিদিন কিছু ট্র্যাফিক (Google Search Console-এ যুক্ত করুন)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
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
