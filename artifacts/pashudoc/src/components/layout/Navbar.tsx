import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Stethoscope, Menu, X, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    queryClient.clear();
    setLocation("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "doctor") return "/doctor/dashboard";
    return "/dashboard";
  };

  const NavLinks = () => (
    <>
      <Link href="/" className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
        হোম
      </Link>
      <Link href="/doctors" className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
        ডাক্তার খুঁজুন
      </Link>
      
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={getDashboardLink()} className="w-full cursor-pointer">
                ড্যাশবোর্ড
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              লগআউট
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
            <Link href="/login">লগইন</Link>
          </Button>
          <Button asChild>
            <Link href="/register">রেজিস্টার</Link>
          </Button>
        </div>
      )}
    </>
  );

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-primary tracking-tight">পশুডক</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border shadow-lg absolute w-full animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-6 flex flex-col space-y-3">
            <Link 
              href="/" 
              className="text-foreground hover:text-primary px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              হোম
            </Link>
            <Link 
              href="/doctors" 
              className="text-foreground hover:text-primary px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              ডাক্তার খুঁজুন
            </Link>
            
            {isAuthenticated ? (
              <div className="border-t border-border pt-4 mt-2">
                <div className="px-3 py-2 text-sm text-muted-foreground mb-1">লগইন করা আছে: {user?.name}</div>
                <Link 
                  href={getDashboardLink()} 
                  className="flex items-center text-foreground hover:text-primary px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ড্যাশবোর্ড
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center text-destructive px-3 py-2 text-base font-medium rounded-md hover:bg-destructive/10 transition-colors mt-1"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild className="w-full justify-center">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>লগইন</Link>
                </Button>
                <Button asChild className="w-full justify-center">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>রেজিস্টার</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
