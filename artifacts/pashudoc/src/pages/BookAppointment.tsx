import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import { useGetDoctor, getGetDoctorQueryKey, useCreateAppointment } from "@workspace/api-client-react";
import { CalendarIcon, MapPin, Stethoscope, Clock, FileText } from "lucide-react";
import { ANIMAL_TYPES, getAnimalIcon } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const bookSchema = z.object({
  animalType: z.string().min(1, { message: "পশুর ধরন নির্বাচন করুন" }),
  animalDescription: z.string().optional(),
  appointmentDate: z.string().min(1, { message: "তারিখ নির্বাচন করুন" }),
  appointmentTime: z.string().min(1, { message: "সময় নির্বাচন করুন" }),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function BookAppointment() {
  const params = useParams();
  const doctorId = Number(params.doctorId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: doctor, isLoading: isLoadingDoctor } = useGetDoctor(doctorId, {
    query: {
      enabled: !!doctorId,
      queryKey: getGetDoctorQueryKey(doctorId)
    }
  });

  const createAppointment = useCreateAppointment();

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      animalType: "",
      animalDescription: "",
      appointmentDate: format(new Date(), "yyyy-MM-dd"),
      appointmentTime: "10:00",
    },
  });

  const onSubmit = (data: BookFormValues) => {
    createAppointment.mutate({
      data: {
        doctorId,
        animalType: data.animalType,
        animalDescription: data.animalDescription,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "অ্যাপয়েন্টমেন্ট সফল হয়েছে",
          description: "ডাক্তার আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করবেন",
        });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "অ্যাপয়েন্টমেন্ট ব্যর্থ হয়েছে",
          description: "অনুগ্রহ করে আবার চেষ্টা করুন",
        });
      }
    });
  };

  if (isLoadingDoctor) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">ডাক্তার খুঁজে পাওয়া যায়নি</h2>
          <Button asChild>
            <Link href="/doctors">ফিরে যান</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["farmer"]}>
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">অ্যাপয়েন্টমেন্ট বুক করুন</h1>
            <p className="text-muted-foreground">আপনার পশুর বিস্তারিত তথ্য এবং সময় নির্বাচন করুন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="border-border shadow-md sticky top-24">
                <CardHeader className="pb-4">
                  <div className="h-16 w-16 bg-primary/10 text-primary flex items-center justify-center rounded-full text-xl font-bold mb-4">
                    {doctor.name.charAt(0)}
                  </div>
                  <CardTitle className="text-xl">{doctor.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" /> {doctor.district}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">পরামর্শ ফি</div>
                      <div className="font-bold text-primary text-lg">৳{doctor.consultationFee}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="border-border shadow-md">
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="animalType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">পশুর ধরন</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 bg-background shadow-sm text-base">
                                  <SelectValue placeholder="পশু নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ANIMAL_TYPES.map(a => {
                                  const Icon = getAnimalIcon(a.id);
                                  return (
                                    <SelectItem key={a.id} value={a.id}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5" />
                                        <span>{a.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="animalDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">সমস্যার বিবরণ (ঐচ্ছিক)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="পশুর কী সমস্যা হচ্ছে তা বিস্তারিত লিখুন..." 
                                className="min-h-[100px] bg-background shadow-sm resize-y text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">তারিখ</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="h-14 bg-background shadow-sm text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="appointmentTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">সময়</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} className="h-14 bg-background shadow-sm text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg hover-elevate shadow-md font-bold mt-4" 
                        disabled={createAppointment.isPending}
                        data-testid="button-confirm-booking"
                      >
                        {createAppointment.isPending ? "বুকিং হচ্ছে..." : "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
