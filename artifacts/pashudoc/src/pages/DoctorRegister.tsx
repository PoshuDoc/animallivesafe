import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS, ANIMAL_TYPES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateDoctor } from "@workspace/api-client-react";
import { Checkbox } from "@/components/ui/checkbox";

const doctorSchema = z.object({
  specialties: z.array(z.string()).min(1, { message: "অন্তত একটি পশুর ধরন নির্বাচন করুন" }),
  district: z.string().min(1, { message: "জেলা নির্বাচন করুন" }),
  upazila: z.string().optional(),
  clinicName: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.coerce.number().min(0, { message: "সঠিক অভিজ্ঞতা দিন" }),
  consultationFee: z.coerce.number().min(0, { message: "সঠিক ফি দিন" }),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function DoctorRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createDoctor = useCreateDoctor();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      specialties: [],
      district: "",
      upazila: "",
      clinicName: "",
      bio: "",
      yearsExperience: 0,
      consultationFee: 0,
    },
  });

  const onSubmit = (data: DoctorFormValues) => {
    createDoctor.mutate({
      data
    }, {
      onSuccess: () => {
        toast({
          title: "প্রোফাইল তৈরি হয়েছে",
          description: "অ্যাডমিন অনুমোদনের পর আপনি প্ল্যাটফর্মে দৃশ্যমান হবেন",
        });
        setLocation("/doctor/dashboard");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "ত্রুটি",
          description: "প্রোফাইল তৈরি করা যায়নি",
        });
      }
    });
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <Layout>
        <div className="flex justify-center items-center py-12 px-4 bg-primary/5 min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-2xl shadow-xl border-border/50">
            <CardHeader className="text-center pb-6 border-b border-border/50 mb-6">
              <CardTitle className="text-2xl font-bold text-foreground">ডাক্তার প্রোফাইল তৈরি করুন</CardTitle>
              <CardDescription>
                রোগীদের সুবিধার জন্য আপনার পেশাগত তথ্য দিন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>জেলা</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
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
                      name="upazila"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>উপজেলা (ঐচ্ছিক)</FormLabel>
                          <FormControl>
                            <Input placeholder="উপজেলার নাম" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>অভিজ্ঞতা (বছর)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="0" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consultationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পরামর্শ ফি (টাকা)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="500" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ক্লিনিক/চেম্বারের নাম (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input placeholder="যেমন: জনসেবা প্রাণী চিকিৎসালয়" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialties"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">বিশেষজ্ঞতা (যেসব পশুর চিকিৎসা করেন)</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {ANIMAL_TYPES.map((animal) => (
                            <FormField
                              key={animal.id}
                              control={form.control}
                              name="specialties"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={animal.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-background"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(animal.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, animal.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== animal.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {animal.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>নিজের সম্পর্কে কিছু কথা (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="আপনার শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা সম্পর্কে সংক্ষেপে লিখুন..." 
                            className="min-h-[120px] bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t border-border/50">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg hover-elevate" 
                      disabled={createDoctor.isPending}
                    >
                      {createDoctor.isPending ? "সেভ হচ্ছে..." : "প্রোফাইল সেভ করুন"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
