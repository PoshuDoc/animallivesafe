import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Check, X, Eye, EyeOff, HelpCircle } from "lucide-react";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiFetch(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("pashudoc_token");
  return fetch(`${API}${path}`, {
    cache: "no-store",
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
}

interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface FaqFormData {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM: FaqFormData = { question: "", answer: "", order: 0, isActive: true };

export function AdminFaq() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FaqFormData>(EMPTY_FORM);

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const res = await apiFetch("/api/admin/faqs");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0,
    gcTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (data: FaqFormData) => {
      const res = await apiFetch("/api/admin/faqs", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("তৈরি ব্যর্থ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast({ title: "সফল", description: "FAQ তৈরি হয়েছে" });
      resetForm();
    },
    onError: () => toast({ title: "ত্রুটি", description: "FAQ তৈরি করা যায়নি", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FaqFormData> }) => {
      const res = await apiFetch(`/api/admin/faqs/${id}`, { method: "PUT", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("আপডেট ব্যর্থ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast({ title: "সফল", description: "FAQ আপডেট হয়েছে" });
      resetForm();
    },
    onError: () => toast({ title: "ত্রুটি", description: "আপডেট করা যায়নি", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("মুছতে ব্যর্থ");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast({ title: "সফল", description: "FAQ মুছে ফেলা হয়েছে" });
    },
    onError: () => toast({ title: "ত্রুটি", description: "মুছতে পারা যায়নি", variant: "destructive" }),
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order, isActive: faq.isActive });
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: "ত্রুটি", description: "প্রশ্ন ও উত্তর পূরণ করুন", variant: "destructive" });
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">FAQ পরিচালনা</h2>
          <p className="text-muted-foreground mt-1">ল্যান্ডিং পেজের প্রায়ই জিজ্ঞাসিত প্রশ্ন যোগ, সম্পাদনা ও মুছুন</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...EMPTY_FORM, order: faqs.length }); }}>
            <Plus className="h-4 w-4 mr-2" />
            নতুন FAQ যোগ করুন
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
              {editingId !== null ? "FAQ সম্পাদনা" : "নতুন FAQ"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>প্রশ্ন <span className="text-destructive">*</span></Label>
              <Input
                placeholder="প্রশ্নটি লিখুন..."
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>উত্তর <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="উত্তরটি লিখুন..."
                rows={4}
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ক্রম (ছোট সংখ্যা আগে দেখাবে)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>অবস্থা</Label>
                <Button
                  type="button"
                  variant={form.isActive ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                >
                  {form.isActive ? (
                    <><Eye className="h-4 w-4 mr-2" />সক্রিয় (দৃশ্যমান)</>
                  ) : (
                    <><EyeOff className="h-4 w-4 mr-2" />নিষ্ক্রিয় (লুকানো)</>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={isBusy}>
                <Check className="h-4 w-4 mr-2" />
                {isBusy ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                বাতিল
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>সকল FAQ</span>
            <Badge variant="secondary">{faqs.length}টি</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">কোনো FAQ নেই</p>
              <p className="text-sm mt-1">উপরের বাটন থেকে নতুন FAQ যোগ করুন</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map(faq => (
                <div
                  key={faq.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${faq.isActive ? "bg-card border-border" : "bg-muted/50 border-border/50 opacity-60"}`}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-foreground leading-snug">{faq.question}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant={faq.isActive ? "default" : "secondary"} className="text-xs">
                          {faq.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">ক্রম: {faq.order}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(faq)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm("এই FAQ মুছে ফেলতে চান?")) deleteMutation.mutate(faq.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
