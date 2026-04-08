import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

const sections = [
  {
    title: "১. আমরা কোন তথ্য সংগ্রহ করি",
    content: [
      "নিবন্ধনের সময় আপনার নাম, মোবাইল নম্বর এবং অবস্থান (জেলা/উপজেলা)।",
      "অ্যাপয়েন্টমেন্ট বুকিংয়ের সময় পশুর ধরন, সমস্যার বিবরণ এবং পছন্দের তারিখ ও সময়।",
      "ডাক্তার নিবন্ধনের সময় শিক্ষাগত যোগ্যতা, বিএমডিসি নম্বর এবং কর্মক্ষেত্রের তথ্য।",
      "প্ল্যাটফর্ম ব্যবহারের সময় স্বয়ংক্রিয়ভাবে সংগৃহীত ডিভাইস তথ্য এবং ব্রাউজিং প্যাটার্ন।",
    ],
  },
  {
    title: "২. তথ্য কীভাবে ব্যবহার করা হয়",
    content: [
      "আপনার অ্যাকাউন্ট তৈরি ও পরিচালনা করতে।",
      "ডাক্তার ও কৃষকের মধ্যে অ্যাপয়েন্টমেন্ট সংযোগ স্থাপন করতে।",
      "পরিষেবার মান উন্নয়নের জন্য বিশ্লেষণ করতে।",
      "প্ল্যাটফর্ম সংক্রান্ত গুরুত্বপূর্ণ আপডেট এবং বিজ্ঞপ্তি পাঠাতে।",
      "প্রতারণা ও অপব্যবহার রোধ করতে।",
    ],
  },
  {
    title: "৩. তথ্য সুরক্ষা",
    content: [
      "আপনার সকল ব্যক্তিগত তথ্য SSL এনক্রিপশনের মাধ্যমে সুরক্ষিত।",
      "পাসওয়ার্ড সবসময় এনক্রিপ্টেড (হ্যাশড) আকারে সংরক্ষিত হয়, কখনো সরাসরি পড়া যায় না।",
      "আমাদের সার্ভারে নিয়মিত নিরাপত্তা পরীক্ষা করা হয়।",
      "শুধুমাত্র অনুমোদিত কর্মীরা ব্যক্তিগত তথ্যে প্রবেশাধিকার পান।",
    ],
  },
  {
    title: "৪. তৃতীয় পক্ষের সাথে তথ্য ভাগাভাগি",
    content: [
      "আমরা আপনার ব্যক্তিগত তথ্য কখনো বিক্রি করি না।",
      "শুধুমাত্র আপনার বুক করা ডাক্তার আপনার অ্যাপয়েন্টমেন্ট-সংক্রান্ত তথ্য দেখতে পারবেন।",
      "আইনি বাধ্যবাধকতা থাকলে বা আদালতের আদেশ থাকলে কর্তৃপক্ষের সাথে তথ্য ভাগ করা হতে পারে।",
      "আমাদের প্রযুক্তি অংশীদাররা (হোস্টিং, ডেটাবেজ) চুক্তির আওতায় তথ্য প্রক্রিয়া করে।",
    ],
  },
  {
    title: "৫. আপনার অধিকার",
    content: [
      "আপনার প্রোফাইল তথ্য যেকোনো সময় সম্পাদনা করার অধিকার আপনার আছে।",
      "অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারবেন — আমরা ৩০ দিনের মধ্যে প্রক্রিয়া করব।",
      "আপনার তথ্যের একটি কপি চাইলে support@pashudoc.com.bd-তে ইমেইল করুন।",
      "মার্কেটিং বার্তা না পেতে চাইলে যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।",
    ],
  },
  {
    title: "৬. কুকিজ",
    content: [
      "পশুডক আপনার লগইন সেশন বজায় রাখতে ব্রাউজার স্টোরেজ ব্যবহার করে।",
      "আমরা তৃতীয় পক্ষের ট্র্যাকিং কুকিজ ব্যবহার করি না।",
      "ব্রাউজার সেটিং থেকে কুকিজ মুছে ফেলা যাবে, তবে লগইন সেশন বাতিল হয়ে যাবে।",
    ],
  },
  {
    title: "৭. নীতিমালার পরিবর্তন",
    content: [
      "আমরা প্রয়োজনে এই নীতিমালা আপডেট করতে পারি।",
      "উল্লেখযোগ্য পরিবর্তন হলে নিবন্ধিত মোবাইল নম্বরে বিজ্ঞপ্তি দেওয়া হবে।",
      "পরিবর্তনের পরেও প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখলে নতুন নীতিমালায় সম্মতি বলে গণ্য হবে।",
    ],
  },
  {
    title: "৮. যোগাযোগ",
    content: [
      "গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নে: privacy@pashudoc.com.bd",
      "ফোন: 01700-000000 (সকাল ৯টা — সন্ধ্যা ৬টা)",
      "ঠিকানা: হাউস ৫, রোড ১২, ধানমন্ডি, ঢাকা — ১২০৯",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary/5 py-16 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/5 px-4 py-1 text-sm font-medium">
            আইনি তথ্য
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">গোপনীয়তা নীতি</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            পশুডক আপনার গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়। এই নীতিমালায় আমরা কী তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি এবং কীভাবে সুরক্ষিত রাখি তা বিস্তারিত বলা হয়েছে।
          </p>
          <p className="text-sm text-muted-foreground mt-4">সর্বশেষ আপডেট: ৮ এপ্রিল, ২০২৬</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {idx < sections.length - 1 && <Separator className="mt-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
