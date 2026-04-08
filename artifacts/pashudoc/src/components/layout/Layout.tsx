import { Navbar } from "./Navbar";
import { Link } from "wouter";
import { Stethoscope, MapPin, Phone, Mail, Facebook, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary rounded-lg">
                  <Stethoscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-primary">পশুডক</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                বাংলাদেশের কৃষক ও পশুপালকদের জন্য বিশ্বস্ত ভেটেরিনারি সেবা প্ল্যাটফর্ম। সারাদেশে অভিজ্ঞ পশু চিকিৎসকদের সাথে সহজে সংযুক্ত হন।
              </p>
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" data-testid="link-facebook" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" data-testid="link-youtube" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-foreground mb-5 text-sm uppercase tracking-wider">দ্রুত লিঙ্ক</h4>
              <ul className="space-y-3">
                {[
                  { label: "হোম", href: "/" },
                  { label: "ডাক্তার খুঁজুন", href: "/doctors" },
                  { label: "আমাদের সম্পর্কে", href: "/about" },
                  { label: "যোগাযোগ করুন", href: "/contact" },
                  { label: "নিবন্ধন করুন", href: "/register" },
                  { label: "লগইন", href: "/login" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`footer-link-${label}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Doctors */}
            <div>
              <h4 className="font-bold text-foreground mb-5 text-sm uppercase tracking-wider">ডাক্তারদের জন্য</h4>
              <ul className="space-y-3">
                {[
                  { label: "ডাক্তার হিসেবে যোগ দিন", href: "/register" },
                  { label: "ডাক্তার ড্যাশবোর্ড", href: "/doctor/dashboard" },
                  { label: "প্রোফাইল আপডেট", href: "/doctor/register" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`footer-link-doctor-${label}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="font-bold text-foreground mt-8 mb-5 text-sm uppercase tracking-wider">সেবা এলাকা</h4>
              <ul className="space-y-2">
                {["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সারাদেশ"].map(district => (
                  <li key={district}>
                    <Link
                      href={`/doctors?district=${district}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="h-3 w-3" />
                      {district}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-foreground mb-5 text-sm uppercase tracking-wider">যোগাযোগ</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">হেল্পলাইন</p>
                    <p className="text-sm text-muted-foreground">01700-000000</p>
                    <p className="text-xs text-muted-foreground">(সকাল ৮টা — রাত ৮টা)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">ইমেইল</p>
                    <p className="text-sm text-muted-foreground">support@pashudoc.com.bd</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">ঠিকানা</p>
                    <p className="text-sm text-muted-foreground">ঢাকা, বাংলাদেশ</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-10" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} পশুডক. সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-privacy">গোপনীয়তা নীতি</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-terms">ব্যবহারের শর্তাবলী</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
