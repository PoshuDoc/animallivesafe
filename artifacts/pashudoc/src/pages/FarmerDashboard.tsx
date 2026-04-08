import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useListAppointments, getListAppointmentsQueryKey, useCreateReview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Star, Calendar as CalendarIcon, Clock, Stethoscope } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { data: appointmentsResponse, isLoading } = useListAppointments({
    query: { queryKey: getListAppointmentsQueryKey() }
  });
  
  const appointments = appointmentsResponse?.appointments || [];

  return (
    <ProtectedRoute allowedRoles={["farmer"]}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">স্বাগতম, {user?.name}</h1>
            <p className="text-muted-foreground">আপনার অ্যাপয়েন্টমেন্ট তালিকা</p>
          </div>

          <Card className="shadow-md border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">আমার অ্যাপয়েন্টমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map(apt => (
                    <div key={apt.id} className="p-4 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">{apt.doctorName}</span>
                            <Badge variant="outline" className={
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {apt.status === 'confirmed' ? 'নিশ্চিত' :
                               apt.status === 'pending' ? 'অপেক্ষমাণ' :
                               apt.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-4 gap-1 mb-2">
                            <span className="flex items-center"><CalendarIcon className="h-3.5 w-3.5 mr-1" /> {format(new Date(apt.appointmentDate), "dd MMM, yyyy")}</span>
                            <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {apt.appointmentTime}</span>
                            <span className="flex items-center"><Stethoscope className="h-3.5 w-3.5 mr-1" /> {apt.animalType}</span>
                          </div>
                          {apt.animalDescription && (
                            <p className="text-sm text-foreground/80 mt-2 bg-accent/30 p-2 rounded">{apt.animalDescription}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          {apt.status === 'completed' && (
                            <ReviewDialog doctorId={apt.doctorId} doctorName={apt.doctorName || "ডাক্তার"} appointmentId={apt.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-accent/20 rounded-xl">
                  <p className="text-muted-foreground mb-4">আপনার কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function ReviewDialog({ doctorId, doctorName, appointmentId }: { doctorId: number, doctorName: string, appointmentId: number }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createReview = useCreateReview();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    createReview.mutate({
      data: {
        doctorId,
        appointmentId,
        rating: data.rating,
        comment: data.comment,
      }
    }, {
      onSuccess: () => {
        toast({ title: "ধন্যবাদ!", description: "আপনার রিভিউ সফলভাবে সাবমিট হয়েছে।" });
        setOpen(false);
        // We could invalidate appointments here if we tracked if it's already reviewed
      },
      onError: () => {
        toast({ variant: "destructive", title: "ত্রুটি", description: "রিভিউ সাবমিট করতে সমস্যা হয়েছে।" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Star className="h-4 w-4 mr-2" /> রিভিউ দিন
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>রিভিউ দিন</DialogTitle>
          <DialogDescription>
            {doctorName}-এর চিকিৎসা সেবা সম্পর্কে আপনার মতামত জানান
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>রেটিং (১-৫)</FormLabel>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`h-8 w-8 ${star <= field.value ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মতামত (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createReview.isPending}>
              সাবমিট করুন
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
