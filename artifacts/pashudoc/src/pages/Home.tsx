import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useGetStats, getGetStatsQueryKey, useListFeaturedDoctors, getListFeaturedDoctorsQueryKey } from "@workspace/api-client-react";
import { Search, MapPin, Stethoscope, Star, ChevronRight, Activity, Users, CalendarCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS, ANIMAL_TYPES, getAnimalIcon } from "@/lib/constants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
              বাংলাদেশের কৃষকদের আস্থার প্রতীক
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6">
              আপনার গবাদি পশুর জন্য <br className="hidden sm:block" />
              <span className="text-primary">সেরা ডাক্তার</span> খুঁজুন
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              ঘরে বসেই আপনার জেলার অভিজ্ঞ ভেটেরিনারি ডাক্তারদের খুঁজুন এবং অ্যাপয়েন্টমেন্ট বুক করুন।
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
                    <SelectContent>
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
                    <SelectContent>
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
              <h2 className="text-3xl font-bold text-foreground mb-2">বিশেষজ্ঞ ডাক্তারগণ</h2>
              <p className="text-muted-foreground text-lg">আমাদের প্ল্যাটফর্মের সেরা রেটিং প্রাপ্ত ডাক্তাররা</p>
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
                        {doctor.averageRating?.toFixed(1) || "5.0"}
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
            <h2 className="text-3xl font-bold text-foreground mb-4">কীভাবে কাজ করে?</h2>
            <p className="text-muted-foreground text-lg">খুব সহজেই মাত্র ৩টি ধাপে আপনার গবাদি পশুর চিকিৎসা নিশ্চিত করুন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border z-0"></div>
            
            <div className="relative z-10 text-center bg-card">
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-card">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">১. ডাক্তার খুঁজুন</h3>
              <p className="text-muted-foreground">আপনার জেলা এবং পশুর ধরন অনুযায়ী অভিজ্ঞ ডাক্তার খুঁজুন</p>
            </div>
            
            <div className="relative z-10 text-center bg-card">
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-card">
                <CalendarCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">২. বুক করুন</h3>
              <p className="text-muted-foreground">আপনার সুবিধামতো সময় ও তারিখ নির্বাচন করে অ্যাপয়েন্টমেন্ট নিন</p>
            </div>
            
            <div className="relative z-10 text-center bg-card">
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-card">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">৩. চিকিৎসা নিন</h3>
              <p className="text-muted-foreground">নির্ধারিত সময়ে ডাক্তারের সাথে দেখা করুন বা ফোনে কথা বলুন</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
