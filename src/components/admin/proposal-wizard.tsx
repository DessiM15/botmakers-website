// SPEC: SPEC-PAGES > /admin/proposals/new — 3-step AI wizard
// DEP-MAP: AI Proposal Generation > UI > ProposalWizard
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Plus, Trash2, ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { createProposal, sendProposal } from "@/lib/actions/proposals";
import { DEFAULT_TERMS } from "@/lib/types/constants";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  phase_label: string;
  sort_order: number;
}

interface ProposalWizardProps {
  leads: Array<{ id: string; fullName: string; email: string; companyName?: string | null }>;
  clients: Array<{ id: string; fullName: string; email: string; company?: string | null }>;
}

export function ProposalWizard({ leads, clients }: ProposalWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Step 1: Context
  const [recipientType, setRecipientType] = useState<"lead" | "client">("lead");
  const [selectedId, setSelectedId] = useState("");
  const [discoveryNotes, setDiscoveryNotes] = useState("");
  const [pricingType, setPricingType] = useState<"fixed" | "phased" | "hourly">("fixed");

  // Step 2: Edit
  const [title, setTitle] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, phase_label: "", sort_order: 0 },
  ]);

  const selectedRecipient = recipientType === "lead"
    ? leads.find((l) => l.id === selectedId)
    : clients.find((c) => c.id === selectedId);

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  async function handleGenerateAI() {
    setAiLoading(true);
    try {
      const recipientName = selectedRecipient
        ? ("fullName" in selectedRecipient ? selectedRecipient.fullName : "")
        : "";
      const response = await fetch("/api/ai/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: recipientName,
          projectType: "Custom Software",
          discoveryNotes,
          pricingType,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error("AI generation failed. Fill in the fields manually.");
        return;
      }

      const data = result.data;
      setTitle(data.title ?? "");
      setScopeOfWork(data.scopeOfWork ?? data.scope_of_work ?? "");
      setDeliverables(data.deliverables ?? "");
      setTerms(data.termsAndConditions ?? data.terms_and_conditions ?? DEFAULT_TERMS);

      const items = data.lineItems ?? data.suggested_line_items ?? data.line_items ?? [];
      if (items.length > 0) {
        setLineItems(
          items.map((item: { description: string; quantity: number; unitPrice?: number; unit_price?: number; phaseLabel?: string; phase_label?: string }, idx: number) => ({
            description: item.description ?? "",
            quantity: item.quantity ?? 1,
            unit_price: item.unitPrice ?? item.unit_price ?? 0,
            phase_label: item.phaseLabel ?? item.phase_label ?? "",
            sort_order: idx,
          }))
        );
      }

      toast.success("AI proposal generated! Review and edit as needed.");
      setStep(2);
    } catch {
      toast.error("AI generation failed. You can fill in the fields manually.");
    } finally {
      setAiLoading(false);
    }
  }

  function addLineItem() {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0, phase_label: "", sort_order: lineItems.length },
    ]);
  }

  function removeLineItem(index: number) {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  }

  async function handleSave(sendAfter: boolean) {
    if (!title.trim() || !scopeOfWork.trim() || !deliverables.trim() || !terms.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const validItems = lineItems.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one line item.");
      return;
    }

    setLoading(true);
    try {
      const result = await createProposal({
        title,
        lead_id: recipientType === "lead" ? selectedId || null : null,
        client_id: recipientType === "client" ? selectedId || null : null,
        scope_of_work: scopeOfWork,
        deliverables,
        terms_and_conditions: terms,
        pricing_type: pricingType,
        line_items: validItems.map((item, idx) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          phase_label: item.phase_label || null,
          sort_order: idx,
        })),
        ai_prompt_context: discoveryNotes || null,
      });

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to save proposal");
        return;
      }

      if (sendAfter && result.data) {
        const sendResult = await sendProposal(result.data.id);
        if (sendResult.success) {
          toast.success("Proposal created and sent!");
        } else {
          toast.success("Proposal saved. Send failed: " + (sendResult.error?.message ?? "Unknown error"));
        }
      } else {
        toast.success("Proposal saved as draft!");
      }

      router.push("/admin/proposals");
    } catch {
      toast.error("Failed to save proposal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s
                  ? "bg-[#03FF00] text-[#033457]"
                  : step > s
                  ? "bg-[#03FF00]/30 text-[#03FF00]"
                  : "bg-white/10 text-gray-500"
              }`}
            >
              {s}
            </div>
            <span className={`text-sm ${step === s ? "text-white" : "text-gray-500"}`}>
              {s === 1 ? "Context" : s === 2 ? "Edit" : "Preview"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-white/20" />}
          </div>
        ))}
      </div>

      {/* Step 1: Context */}
      {step === 1 && (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Step 1: Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select value={recipientType} onValueChange={(v) => { setRecipientType(v as "lead" | "client"); setSelectedId(""); }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{recipientType === "lead" ? "Select Lead" : "Select Client"}</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(recipientType === "lead" ? leads : clients).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.fullName} ({item.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select value={pricingType} onValueChange={(v) => setPricingType(v as "fixed" | "phased" | "hourly")}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="phased">Phased</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discovery Notes</Label>
              <Textarea
                value={discoveryNotes}
                onChange={(e) => setDiscoveryNotes(e.target.value)}
                placeholder="Paste discovery call notes, project requirements, or any context for AI..."
                rows={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                Generate with AI
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Skip to Manual <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Edit */}
      {step === 2 && (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Step 2: Edit Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Proposal Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI-Powered CRM for Acme Corp"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Scope of Work *</Label>
              <Textarea
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                rows={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Deliverables *</Label>
              <Textarea
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Terms & Conditions *</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button onClick={addLineItem} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        placeholder="Description"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="col-span-2 text-right pt-2 text-sm text-gray-400">
                      ${(item.quantity * item.unit_price).toLocaleString()}
                    </div>
                    <div className="col-span-1">
                      <Button
                        onClick={() => removeLineItem(idx)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        disabled={lineItems.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <p className="text-lg font-bold">Total: ${total.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
              >
                Preview <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Step 3: Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">{title || "Untitled Proposal"}</h2>
              {selectedRecipient && (
                <p className="text-sm text-gray-400">
                  For: {selectedRecipient.fullName} ({selectedRecipient.email})
                </p>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#03FF00] mb-1">Scope of Work</h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{scopeOfWork}</div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#03FF00] mb-1">Deliverables</h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{deliverables}</div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#03FF00] mb-1">Pricing</h3>
                <Badge className="bg-white/10 text-gray-300 mb-2">{pricingType}</Badge>
                <div className="space-y-1">
                  {lineItems.filter((i) => i.description).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.description} (x{item.quantity})</span>
                      <span>${(item.quantity * item.unit_price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#03FF00] mb-1">Terms & Conditions</h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{terms}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={loading}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                Send to Client
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
