import { Navbar } from "./Navbar";

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
      <footer className="bg-card border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">পশুডক</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} পশুডক. সর্বস্বত্ব সংরক্ষিত. গ্রামীণ বাংলাদেশের কৃষকদের জন্য তৈরি।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
