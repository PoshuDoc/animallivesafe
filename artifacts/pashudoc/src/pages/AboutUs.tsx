import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Target,
  Eye,
  Heart,
  Stethoscope,
  Users,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";

const team = [
  {
    name: "ডা. রাশেদুল ইসলাম",
    role: "প্রতিষ্ঠাতা ও সিইও",
    bio: "বাংলাদেশ কৃষি বিশ্ববিদ্যালয় থেকে ভেটেরিনারি মেডিসিনে স্নাতক। কৃষকদের সাশ্রয়ী পশু চিকিৎসা সেবা দেওয়ার স্বপ্নে পশুডক প্রতিষ্ঠা করেন।",
    initial: "র",
  },
  {
    name: "ফারহানা আক্তার",
    role: "প্রধান পরিচালন কর্মকর্তা",
    bio: "ঢাকা বিশ্ববিদ্যালয় থেকে ব্যবসা প্রশাসনে মাস্টার্স। গ্রামীণ স্বাস্থ্যসেবা খাতে ১০ বছরের অভিজ্ঞতা।",
    initial: "ফ",
  },
  {
    name: "মো. তানভীর হোসেন",
    role: "প্রযুক্তি প্রধান",
    bio: "বুয়েট থেকে কম্পিউটার সায়েন্সে স্নাতক। কৃষি প্রযুক্তি খাতে উদ্ভাবনী সমাধান তৈরিতে অভিজ্ঞ।",
    initial: "ত",
  },
];

const values = [
  {
    icon: Heart,
    title: "পশুর প্রতি ভালোবাসা",
    desc: "প্রতিটি গবাদি পশুর সুস্বাস্থ্য নিশ্চিত করা আমাদের প্রধান লক্ষ্য। কৃষকের পশু মানেই তার জীবিকা।",
  },
  {
    icon: ShieldCheck,
    title: "বিশ্বস্ততা ও স্বচ্ছতা",
    desc: "সব ডাক্তারের সার্টিফিকেট যাচাই করা হয়। কোনো লুকানো চার্জ নেই — সব তথ্য পরিষ্কারভাবে দেখানো হয়।",
  },
  {
    icon: Users,
    title: "কৃষকবান্ধব সেবা",
    desc: "সহজ বাংলা ভাষায়, মোবাইলে সহজে ব্যবহারযোগ্য। প্রযুক্তি যেন কৃষকের কাজে আসে।",
  },
  {
    icon: MapPin,
    title: "সারাদেশে পৌঁছানো",
    desc: "শুধু শহরে নয়, প্রত্যন্ত গ্রাম পর্যন্ত ভেটেরিনারি সেবা পৌঁছে দেওয়াই আমাদের লক্ষ্য।",
  },
];

export default function AboutUs() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary/5 py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            আমাদের সম্পর্কে
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            পশুডক — কৃষকের <span className="text-primary">পাশে থাকার</span> প্রতিশ্রুতি
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            বাংলাদেশের কোটি কৃষকের পশু সম্পদ রক্ষায় আমরা কাজ করছি। সঠিক সময়ে সঠিক চিকিৎসা — এটাই পশুডকের লক্ষ্য।
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">আমাদের লক্ষ্য</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  বাংলাদেশের প্রতিটি কৃষককে তার নিকটস্থ অভিজ্ঞ পশু চিকিৎসকের সাথে সহজে সংযুক্ত করা। ডিজিটাল প্রযুক্তির মাধ্যমে গ্রামীণ পশু স্বাস্থ্যসেবার মানোন্নয়ন করা এবং কৃষকের আর্থিক ক্ষতি কমানো।
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">আমাদের দৃষ্টিভঙ্গি</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  এমন একটি বাংলাদেশ গড়তে চাই যেখানে কোনো কৃষক তার অসুস্থ পশুর জন্য ডাক্তার খুঁজে না পেয়ে ক্ষতিগ্রস্ত হবেন না। ২০৩০ সালের মধ্যে সকল ৬৪ জেলায় পশুডকের সক্রিয় নেটওয়ার্ক তৈরি করা আমাদের স্বপ্ন।
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
                আমাদের গল্প
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">কেন পশুডক তৈরি হলো?</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ২০২৩ সালে আমাদের প্রতিষ্ঠাতা রাজশাহীর এক প্রত্যন্ত গ্রামে গিয়ে দেখেন যে একজন কৃষক তার গাভীর চিকিৎসার জন্য ঘণ্টার পর ঘণ্টা ডাক্তার খুঁজে পাচ্ছেন না। শেষ পর্যন্ত গাভীটি মারা যায় — যেটি ওই পরিবারের প্রধান আয়ের উৎস ছিল।
                </p>
                <p>
                  এই ঘটনাই পশুডক তৈরির অনুপ্রেরণা। আমরা প্রযুক্তি ব্যবহার করে কৃষক ও ডাক্তারের মধ্যে সেতুবন্ধন তৈরি করতে চাই, যাতে এমন ট্র্যাজেডি আর না ঘটে।
                </p>
                <p>
                  আজ পশুডকে ৬৪ জেলার শত শত ভেটেরিনারি ডাক্তার নিবন্ধিত, এবং হাজার হাজার কৃষক প্রতিদিন উপকৃত হচ্ছেন।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Stethoscope, number: "৫০০+", label: "নিবন্ধিত ডাক্তার" },
                { icon: Users, number: "৫০,০০০+", label: "উপকৃত কৃষক" },
                { icon: MapPin, number: "৬৪", label: "জেলায় সেবা" },
                { icon: Heart, number: "৯৮%", label: "সন্তুষ্ট ব্যবহারকারী" },
              ].map(({ icon: Icon, number, label }) => (
                <Card key={label} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-1">{number}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">আমাদের মূল্যবোধ</h2>
            <p className="text-muted-foreground text-lg">যে নীতিগুলো আমাদের পথ দেখায়</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border/50 text-center hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-2xl">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">আমাদের দল</h2>
            <p className="text-muted-foreground text-lg">যারা পশুডককে বাস্তবে রূপ দিয়েছেন</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map(({ name, role, bio, initial }) => (
              <Card key={name} className="border-border/50 text-center">
                <CardContent className="p-8">
                  <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-5">
                    {initial}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
                  <p className="text-primary text-sm font-medium mb-4">{role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">আমাদের যাত্রায় যোগ দিন</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            কৃষক বা ডাক্তার — যেই হোন না কেন, পশুডকে আপনার স্বাগত।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold hover-elevate" asChild>
              <Link href="/register">
                নিবন্ধন করুন <ArrowRight className="ml-2 h-4 w-4" />
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
