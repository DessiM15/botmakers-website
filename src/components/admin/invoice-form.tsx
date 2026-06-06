// SPEC: SPEC-PAGES > /admin/invoices/new — form with line items + Square send
// DEP-MAP: Square Billing > UI > InvoiceForm
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { createInvoice } from "@/lib/actions/invoices";
import { sendViaSquare } from "@/lib/actions/invoices";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  sort_order: number;
}

interface InvoiceFormProps {
  clients: Array<{ id: string; fullName: string; email: string }>;
  projects: Array<{ id: string; name: string; clientId: string }>;
}

export function InvoiceForm({ clients, projects }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, sort_order: 0 },
  ]);

  const filteredProjects = projectId
    ? projects
    : projects.filter((p) => p.clientId === clientId);

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  function addLineItem() {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0, sort_order: lineItems.length },
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

  async function handleSave(sendSquare: boolean) {
    if (!clientId || !title.trim() || !dueDate) {
      toast.error("Please fill in client, title, and due date.");
      return;
    }

    const validItems = lineItems.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one line item.");
      return;
    }

    setLoading(true);
    try {
      const result = await createInvoice({
        client_id: clientId,
        project_id: projectId || null,
        title,
        description: description || undefined,
        line_items: validItems.map((item, idx) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          sort_order: idx,
        })),
        due_date: dueDate,
      });

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to create invoice");
        return;
      }

      if (sendSquare && result.data) {
        const squareResult = await sendViaSquare(result.data.id);
        if (squareResult.success) {
          toast.success("Invoice created and sent via Square!");
        } else {
          toast.success("Invoice saved as draft. Square sync failed: " + (squareResult.error?.message ?? ""));
        }
      } else {
        toast.success("Invoice saved as draft!");
      }

      router.push("/admin/invoices");
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/10 bg-white/5 text-white max-w-3xl">
      <CardHeader>
        <CardTitle>New Invoice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v); setProjectId(""); }}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {filteredProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Invoice Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., MVP Build — Phase 1"
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label>Due Date *</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Line Items</Label>
            <Button onClick={addLineItem} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-6">
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
                <div className="col-span-1 text-right pt-2 text-sm text-gray-400">
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
            Send via Square
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
