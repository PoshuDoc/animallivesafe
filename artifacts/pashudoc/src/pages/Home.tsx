import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useGetStats, getGetStatsQueryKey, useListFeaturedDoctors, getListFeaturedDoctorsQueryKey } from "@workspace/api-client-react";
import { Search, MapPin, Stethoscope, Star, ChevronRight, Activity, Users, CalendarCheck, ShieldCheck, PhoneCall, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS, ANIMAL_TYPES, getAnimalIcon } from "@/lib/constants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSiteContent, useFaqs } from "@/hooks/useSiteContent";

const DEFAULTS: Record<string, string> = {
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
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [district, setDistrict] = useState<string>("");
  const [animalType, setAnimalType] = useState<string>("");

  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  const { data: featuredDoctors, isLoading: isLoadingDoctors } = useListFeaturedDoctors({
    query: { queryKey: getListFeaturedDoctorsQueryKey() }
  });

  const { data: siteContent = {} } = useSiteContent();
  const { data: faqs = [] } = useFaqs();

  const c = (key: string) => siteContent[key] || DEFAULTS[key] || "";

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (district && district !== "all") params.append("district", district);
    if (animalType && animalType !== "all") params.append("specialty", animalType);
    setLocation(`/doctors?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary/5 pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
              {c("landing_hero_badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6">
              {c("landing_hero_title").split("সেরা ডাক্তার").length > 1 ? (
                <>
                  {c("landing_hero_title").split("সেরা ডাক্তার")[0]}
                  <br className="hidden sm:block" />
                  <span className="text-primary">সেরা ডাক্তার</span>
                  {c("landing_hero_title").split("সেরা ডাক্তার")[1]}
                </>
              ) : c("landing_hero_title")}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              {c("landing_hero_subtitle")}
            </p>

            {/* Search Box */}
            <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-xl border border-border/50 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="h-14 text-base border-input bg-background/50 data-[state=open]:border-primary" data-testid="select-district">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="জেলা নির্বাচন করুন" />
                      </div>
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-72 overflow-y-auto">
                      <SelectItem value="all">সব জেলা</SelectItem>
                      {DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={animalType} onValueChange={setAnimalType}>
                    <SelectTrigger className="h-14 text-base border-input bg-background/50 data-[state=open]:border-primary" data-testid="select-animal">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="পশুর ধরন" />
                      </div>
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">সব ধরন</SelectItem>
                      {ANIMAL_TYPES.map(a => {
                        const Icon = getAnimalIcon(a.id);
                        return (
                          <SelectItem key={a.id} value={a.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{a.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base shadow-md hover-elevate font-semibold"
                  onClick={handleSearch}
                  data-testid="button-search"
                >
                  <Search className="mr-2 h-5 w-5" />
                  খুঁজুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Stethoscope className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stats?.totalDoctors || 0}+</h3>
              <p className="text-sm text-muted-foreground font-medium">নিবন্ধিত ডাক্তার</p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stats?.totalFarmers || 0}+</h3>
              <p className="text-sm text-muted-foreground font-medium">উপকৃত খামারি</p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <CalendarCheck className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stats?.totalAppointments || 0}+</h3>
              <p className="text-sm text-muted-foreground font-medium">সফল অ্যাপয়েন্টমেন্ট</p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <MapPin className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stats?.totalDistricts || 0}+</h3>
              <p className="text-sm text-muted-foreground font-medium">জেলায় সেবা</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{c("landing_featured_title")}</h2>
              <p className="text-muted-foreground text-lg">{c("landing_featured_subtitle")}</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex text-primary hover:text-primary hover:bg-primary/10">
              <Link href="/doctors">
                সব ডাক্তার দেখুন <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingDoctors ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
                    <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded"></div>
                      <div className="h-6 w-16 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredDoctors?.length ? (
              featuredDoctors.slice(0, 3).map(doctor => (
                <Card key={doctor.id} className="overflow-hidden hover-elevate transition-all border-border/50 hover:border-primary/30 flex flex-col h-full">
                  <CardContent className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-16 w-16 bg-primary/10 text-primary flex items-center justify-center rounded-full text-xl font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold px-2 py-1">
                        <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                        {doctor.averageRating?.toFixed(1) || "৫.০"}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{doctor.name}</h3>
                    <p className="text-muted-foreground text-sm flex items-center mb-4">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> {doctor.upazila ? `${doctor.upazila}, ` : ''}{doctor.district}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doctor.specialties.map(spec => {
                        const Icon = getAnimalIcon(spec);
                        const animalLabel = ANIMAL_TYPES.find(a => a.id === spec)?.label || spec;
                        return (
                          <Badge key={spec} variant="outline" className="bg-background text-xs py-1 border-border">
                            <Icon className="h-3 w-3 mr-1 text-primary" />
                            {animalLabel}
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="text-sm font-medium text-foreground bg-accent/50 p-3 rounded-lg flex items-center justify-between mt-auto">
                      <span className="text-muted-foreground">পরামর্শ ফি:</span>
                      <span className="text-primary font-bold text-lg">৳{doctor.consultationFee}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 gap-3 border-t border-border/50 bg-background/50">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${doctor.phone}`}>কল করুন</a>
                    </Button>
                    <Button className="w-full hover-elevate" asChild>
                      <Link href={`/book/${doctor.id}`}>বুক করুন</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                কোনো ডাক্তার পাওয়া যায়নি
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/doctors">সব ডাক্তার দেখুন</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{c("landing_how_title")}</h2>
            <p className="text-muted-foreground text-lg">{c("landing_how_subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border z-0"></div>
            
            <div className="relative z-10 text-center bg-card">
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-card">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{c("landing_step1_title")}</h3>
              <p className="text-muted-foreground">{c("landing_step1_desc")}</p>
            </div>
            
            <div className="relative z-10 text-center bg-card">
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-card">
                <CalendarCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{c("landing_step2_title")}</h3>
              <p className="text-muted-foreground">{c("landing_step2_desc")}</p>
            </div>
            
            <div className="relative z-10 text-center bg-card">
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-card">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{c("landing_step3_title")}</h3>
              <p className="text-muted-foreground">{c("landing_step3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background border-t border-border" data-testid="section-faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
              {c("landing_faq_badge")}
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">{c("landing_faq_title")}</h2>
            <p className="text-muted-foreground text-lg">{c("landing_faq_subtitle")}</p>
          </div>

          {faqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={faq.id}
                  value={`faq-${faq.id}`}
                  className="border border-border rounded-xl px-6 bg-card shadow-sm"
                  data-testid={`faq-item-${idx + 1}`}
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="faq-1" className="border border-border rounded-xl px-6 bg-card shadow-sm" data-testid="faq-item-1">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  পশুডক কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  হ্যাঁ, কৃষক ও পশুর মালিকদের জন্য পশুডক ব্যবহার সম্পূর্ণ বিনামূল্যে। ডাক্তার খোঁজা, প্রোফাইল দেখা এবং অ্যাপয়েন্টমেন্ট বুক করা — সব কিছুই ফ্রি।
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border border-border rounded-xl px-6 bg-card shadow-sm" data-testid="faq-item-2">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  আমি কি ডাক্তার হিসেবে নিবন্ধন করতে পারি?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  হ্যাঁ। যেকোনো সরকারি-স্বীকৃত ভেটেরিনারি ডাক্তার নিবন্ধন করতে পারেন। রেজিস্ট্রেশনের পর আমাদের টিম আপনার সার্টিফিকেট যাচাই করবে এবং ২৪-৪৮ ঘণ্টার মধ্যে প্রোফাইল অনুমোদন দেওয়া হবে।
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border border-border rounded-xl px-6 bg-card shadow-sm" data-testid="faq-item-3">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  অ্যাপয়েন্টমেন্ট বাতিল করলে কী হবে?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  আপনি যেকোনো সময় আপনার ড্যাশবোর্ড থেকে অ্যাপয়েন্টমেন্ট বাতিল করতে পারবেন। আমরা অনুরোধ করি অন্তত ২ ঘণ্টা আগে বাতিল করতে।
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border border-border rounded-xl px-6 bg-card shadow-sm" data-testid="faq-item-4">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  কোন কোন ধরনের পশুর জন্য ডাক্তার পাওয়া যাবে?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  পশুডকে গরু, ছাগল, মহিষ, ভেড়া, হাঁস, মুরগি, কুকুর ও বিড়ালের জন্য বিশেষজ্ঞ ডাক্তার পাওয়া যায়।
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5" className="border border-border rounded-xl px-6 bg-card shadow-sm" data-testid="faq-item-5">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  আমার এলাকায় ডাক্তার না থাকলে কী করব?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  কাছের জেলার ডাক্তার খুঁজুন। অনেক ডাক্তার ফোনে প্রাথমিক পরামর্শ দেন। ডাক্তারের কার্ডে থাকা "কল করুন" বাটনে চাপ দিলেই সরাসরি কথা বলতে পারবেন।
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground" data-testid="section-cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
                {c("landing_cta_title")}
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                {c("landing_cta_desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-base font-semibold hover-elevate shadow-lg"
                  asChild
                  data-testid="cta-button-register"
                >
                  <Link href="/register">
                    এখনই নিবন্ধন করুন
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  asChild
                  data-testid="cta-button-find-doctor"
                >
                  <Link href="/doctors">
                    <Search className="mr-2 h-5 w-5" />
                    ডাক্তার খুঁজুন
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: "যাচাইকৃত ডাক্তার", desc: "সকল ডাক্তার সার্টিফিকেট যাচাই করে অনুমোদিত" },
                { icon: CalendarCheck, title: "সহজ বুকিং", desc: "মাত্র কয়েক ক্লিকে অ্যাপয়েন্টমেন্ট নিন" },
                { icon: PhoneCall, title: "সরাসরি যোগাযোগ", desc: "এক বাটনে ডাক্তারকে সরাসরি কল করুন" },
                { icon: Star, title: "রেটিং ও রিভিউ", desc: "অন্য কৃষকদের অভিজ্ঞতা দেখে সিদ্ধান্ত নিন" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-primary-foreground/10 rounded-xl p-5 border border-primary-foreground/20">
                  <Icon className="h-7 w-7 mb-3 text-primary-foreground/80" />
                  <h4 className="font-bold text-sm mb-1">{title}</h4>
                  <p className="text-primary-foreground/70 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
