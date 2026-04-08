import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS, ANIMAL_TYPES, getAnimalIcon } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";

const farmerSchema = z.object({
  name: z.string().min(2, { message: "নাম কমপক্ষে ২ অক্ষরের হতে হবে" }),
  phone: z.string().min(11, { message: "সঠিক মোবাইল নম্বর দিন" }),
  email: z.string().email({ message: "সঠিক ইমেইল দিন" }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }),
  district: z.string().min(1, { message: "জেলা নির্বাচন করুন" }),
});

type FarmerFormValues = z.infer<typeof farmerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [role, setRole] = useState<"farmer" | "doctor" | null>(null);

  const registerMutation = useRegister();

  const form = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      district: "",
    },
  });

  const onSubmit = (data: FarmerFormValues) => {
    if (!role) return;

    registerMutation.mutate(
      { data: { ...data, role } },
      {
        onSuccess: (res) => {
          setToken(res.token);
          toast({
            title: "রেজিস্ট্রেশন সফল হয়েছে",
            description: "স্বাগতম পশুডক প্ল্যাটফর্মে!",
          });
          
          if (role === "doctor") {
            setLocation("/doctor/register"); // redirect to complete profile
          } else {
            setLocation("/dashboard");
          }
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error && err.message.includes("already registered")
              ? "এই মোবাইল নম্বর আগেই নিবন্ধিত। অনুগ্রহ করে লগইন করুন।"
              : "অনুগ্রহ করে আবার চেষ্টা করুন";
          toast({
            variant: "destructive",
            title: "রেজিস্ট্রেশন ব্যর্থ হয়েছে",
            description: message,
          });
        },
      }
    );
  };

  if (!role) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-4rem)] bg-primary/5">
          <div className="max-w-2xl w-full text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">আপনি কে?</h1>
            <p className="text-muted-foreground text-lg">পশুডক প্ল্যাটফর্মে যোগ দিতে আপনার ধরন নির্বাচন করুন</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all text-center p-6 border-2"
              onClick={() => setRole("farmer")}
              data-testid="role-farmer"
            >
              <div className="h-32 w-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <img src="https://api.iconify.design/lucide:tractor.svg?color=%2335824c" alt="Farmer" className="h-16 w-16" />
              </div>
              <h2 className="text-2xl font-bold mb-2">আমি একজন খামারি</h2>
              <p className="text-muted-foreground">গবাদি পশুর চিকিৎসার জন্য ডাক্তার খুঁজছি</p>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all text-center p-6 border-2"
              onClick={() => setRole("doctor")}
              data-testid="role-doctor"
            >
              <div className="h-32 w-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <img src="https://api.iconify.design/lucide:stethoscope.svg?color=%2335824c" alt="Doctor" className="h-16 w-16" />
              </div>
              <h2 className="text-2xl font-bold mb-2">আমি একজন ডাক্তার</h2>
              <p className="text-muted-foreground">খামারিদের চিকিৎসা সেবা প্রদান করতে চাই</p>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              ইতিমধ্যে অ্যাকাউন্ট আছে? <Link href="/login" className="text-primary font-semibold hover:underline">লগইন করুন</Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] p-4 bg-primary/5">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {role === "farmer" ? "খামারি হিসেবে" : "ডাক্তার হিসেবে"} রেজিস্ট্রেশন
            </CardTitle>
            <CardDescription>
              আপনার সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সম্পূর্ণ নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="মো. আব্দুর রহমান" {...field} className="h-12 bg-background" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>মোবাইল নম্বর</FormLabel>
                      <FormControl>
                        <Input placeholder="01XXXXXXXXX" type="tel" {...field} className="h-12 bg-background" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ইমেইল ঠিকানা (ঐচ্ছিক)</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" type="email" {...field} className="h-12 bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>আপনার জেলা</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background" data-testid="input-district">
                            <SelectValue placeholder="জেলা নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISTRICTS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পাসওয়ার্ড</FormLabel>
                      <FormControl>
                        <Input placeholder="******" type="password" {...field} className="h-12 bg-background" data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg hover-elevate" 
                    disabled={registerMutation.isPending}
                    data-testid="button-submit-register"
                  >
                    {registerMutation.isPending ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
                  </Button>
                </div>
              </form>
            </Form>
            
            <div className="mt-6 text-center space-y-2">
              <Button variant="link" onClick={() => setRole(null)} className="text-muted-foreground h-auto p-0">
                ধরন পরিবর্তন করুন
              </Button>
              <p className="text-sm text-muted-foreground">
                ইতিমধ্যে অ্যাকাউন্ট আছে? <Link href="/login" className="text-primary font-semibold hover:underline">লগইন করুন</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
