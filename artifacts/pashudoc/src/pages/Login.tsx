import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { Stethoscope } from "lucide-react";

const loginSchema = z.object({
  phone: z.string().min(11, { message: "সঠিক মোবাইল নম্বর দিন" }),
  password: z.string().min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setToken(res.token);
          toast({
            title: "লগইন সফল হয়েছে",
            description: "স্বাগতম!",
          });
          
          if (res.user.role === "admin") setLocation("/admin");
          else if (res.user.role === "doctor") setLocation("/doctor/dashboard");
          else setLocation("/dashboard");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "লগইন ব্যর্থ হয়েছে",
            description: "সঠিক মোবাইল নম্বর ও পাসওয়ার্ড দিন",
          });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] p-4 bg-primary/5">
        <div className="w-full max-w-md mb-6 flex justify-center">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg">
            <Stethoscope className="h-10 w-10" />
          </div>
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">লগইন করুন</CardTitle>
            <CardDescription>
              আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিন
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    disabled={loginMutation.isPending}
                    data-testid="button-submit-login"
                  >
                    {loginMutation.isPending ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  </Button>
                </div>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                অ্যাকাউন্ট নেই? <Link href="/register" className="text-primary font-semibold hover:underline">রেজিস্ট্রেশন করুন</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
