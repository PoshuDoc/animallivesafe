import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Target,
  Eye,
  Rocket,
  Heart,
  Leaf,
  Users,
  MapPin,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const milestones = [
  { year: "২০২৩", title: "পশুডকের জন্ম", desc: "রাজশাহীর একটি গ্রামের ঘটনা থেকে অনুপ্রাণিত হয়ে পশুডকের যাত্রা শুরু।" },
  { year: "২০২৪", title: "প্রথম ১০০ ডাক্তার", desc: "বাংলাদেশের ৮টি বিভাগে ১০০ জন ভেটেরিনারি ডাক্তার নিবন্ধিত হন।" },
  { year: "২০২৫", title: "১০,০০০ কৃষক", desc: "দশ হাজার কৃষক পশুডকের মাধ্যমে সেবা গ্রহণ করেন। সফল অ্যাপয়েন্টমেন্ট ৫০,০০০ ছাড়িয়ে যায়।" },
  { year: "২০২৬", title: "সারাদেশে বিস্তার", desc: "বাংলাদেশের সকল ৬৪ জেলায় পশুডকের নেটওয়ার্ক সম্প্রসারণের লক্ষ্যমাত্রা নির্ধারণ।" },
];

const goals2030 = [
  { icon: Users, number: "১০ লাখ+", label: "কৃষক উপকৃত" },
  { icon: ShieldCheck, number: "৫,০০০+", label: "নিবন্ধিত ডাক্তার" },
  { icon: MapPin, number: "৬৪/৬৪", label: "জেলায় সক্রিয়" },
  { icon: TrendingUp, number: "৯৫%", label: "গ্রাহক সন্তুষ্টি" },
];

const pillars = [
  {
    icon: Heart,
    title: "পশুর প্রতি দায়িত্ব",
    desc: "প্রতিটি গবাদি পশু একটি পরিবারের জীবিকা। সঠিক সময়ে সঠিক চিকিৎসা নিশ্চিত করে কৃষকের ক্ষতি কমানো আমাদের মিশনের কেন্দ্রবিন্দু।",
  },
  {
    icon: Leaf,
    title: "টেকসই কৃষি",
    desc: "সুস্থ পশু মানেই উৎপাদনশীল খামার। পশুডক কৃষিখাতের টেকসই উন্নয়নে অবদান রাখতে চায়।",
  },
  {
    icon: Users,
    title: "সমাজের পরিবর্তন",
    desc: "গ্রামীণ কৃষক যেন প্রযুক্তির সুবিধা থেকে বঞ্চিত না হন — প্রযুক্তিকে সবার কাছে সহজলভ্য করাই আমাদের সামাজিক লক্ষ্য।",
  },
  {
    icon: Rocket,
    title: "উদ্ভাবন",
    desc: "কৃত্রিম বুদ্ধিমত্তা ও ডিজিটাল প্রযুক্তি ব্যবহার করে পশু রোগ নির্ণয় ও চিকিৎসাকে আরো সহজ করার পরিকল্পনা আমাদের আছে।",
  },
];

export default function Mission() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary/5 py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            আমাদের মিশন
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            বাংলাদেশের প্রতিটি পশুর জন্য <br className="hidden sm:block" />
            <span className="text-primary">সঠিক চিকিৎসা নিশ্চিত করা</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            কোটি কৃষকের পশু সম্পদ রক্ষায় ডিজিটাল প্রযুক্তিকে কাজে লাগিয়ে একটি সুষ্ঠু, ন্যায়সঙ্গত এবং সহজলভ্য পশু স্বাস্থ্যসেবা ব্যবস্থা গড়ে তোলা।
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">মিশন</h2>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  বাংলাদেশের প্রতিটি কৃষক ও পশুপালককে তার নিকটস্থ যোগ্য ভেটেরিনারি ডাক্তারের সাথে সহজে, দ্রুত এবং বিশ্বাসযোগ্যভাবে সংযুক্ত করা। ডিজিটাল প্রযুক্তির মাধ্যমে পশু স্বাস্থ্যসেবার মানোন্নয়ন করা এবং কৃষকের আর্থিক সুরক্ষা নিশ্চিত করা।
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">ভিশন</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  ২০৩০ সালের মধ্যে এমন একটি বাংলাদেশ গড়া যেখানে কোনো কৃষক অজ্ঞতা বা ডাক্তারের অভাবে তার পশু হারাবেন না। পশুডক হবে দক্ষিণ এশিয়ার সবচেয়ে বিশ্বস্ত ভেটেরিনারি সংযোগ প্ল্যাটফর্ম।
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Four Pillars */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">মিশনের চার স্তম্ভ</h2>
            <p className="text-muted-foreground text-lg">যে চারটি মূল্যবোধের উপর দাঁড়িয়ে পশুডক</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">আমাদের যাত্রার মাইলফলক</h2>
            <p className="text-muted-foreground text-lg">শুরু থেকে এখন পর্যন্ত</p>
          </div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>

            <div className="space-y-10">
              {milestones.map((m, idx) => (
                <div key={m.year} className={`relative flex flex-col md:flex-row gap-6 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                  <div className="md:w-1/2 flex md:justify-center">
                    <div className="hidden md:flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-md z-10">
                      {m.year.slice(-2)}
                    </div>
                  </div>
                  <Card className={`md:w-1/2 border-border/50 ${idx % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/10 border-0">{m.year}</Badge>
                      <h3 className="font-bold text-foreground mb-2">{m.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2030 Goals */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">২০৩০ সালের লক্ষ্যমাত্রা</h2>
            <p className="text-muted-foreground text-lg">যে স্বপ্ন নিয়ে আমরা এগিয়ে যাচ্ছি</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {goals2030.map(({ icon: Icon, number, label }) => (
              <Card key={label} className="border-border/50 text-center">
                <CardContent className="py-8 px-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{number}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">এই মিশনে আপনিও অংশ নিন</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            কৃষক হিসেবে বা ডাক্তার হিসেবে — যেকোনো ভূমিকায় আপনার অংশগ্রহণ আমাদের মিশনকে এগিয়ে নিয়ে যায়।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold hover-elevate" asChild>
              <Link href="/register">
                এখনই যোগ দিন <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
