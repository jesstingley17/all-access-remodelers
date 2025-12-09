import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, ArrowLeft, CheckCircle, CreditCard, Target, FileText } from "lucide-react";

const BUDGET_RANGES = [
  { value: "1k-5k", label: "$1,000 - $5,000", description: "Small projects" },
  { value: "5k-15k", label: "$5,000 - $15,000", description: "Medium projects" },
  { value: "15k-50k", label: "$15,000 - $50,000", description: "Large projects" },
  { value: "50k-100k", label: "$50,000 - $100,000", description: "Enterprise projects" },
  { value: "100k+", label: "$100,000+", description: "Major initiatives" }
];

const PAYMENT_TERMS = [
  { value: "net_15", label: "Net 15", description: "Payment due within 15 days" },
  { value: "net_30", label: "Net 30", description: "Payment due within 30 days" },
  { value: "net_45", label: "Net 45", description: "Payment due within 45 days" },
  { value: "50_50", label: "50/50 Split", description: "50% upfront, 50% on completion" },
  { value: "milestone_based", label: "Milestone-based", description: "Payment tied to project milestones" }
];

const CLIENT_TIERS = [
  { value: "A", label: "Tier A - Premium", description: "High-value, strategic clients", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "B", label: "Tier B - Standard", description: "Regular business clients", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "C", label: "Tier C - Developing", description: "New or smaller clients", color: "text-slate-600 bg-slate-50 border-slate-200" }
];

export default function BusinessDetailsForm({ data, onChange, onSubmit, onPrev, isSubmitting }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <DollarSign className="w-5 h-5" />
          Business Details & Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Budget Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Typical Project Budget Range</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {BUDGET_RANGES.map((budget) => (
                <div
                  key={budget.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.budget_range === budget.value
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ budget_range: budget.value })}
                >
                  <div className="font-semibold text-slate-900">{budget.label}</div>
                  <div className="text-sm text-slate-600">{budget.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Preferred Payment Terms</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {PAYMENT_TERMS.map((term) => (
                <div
                  key={term.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.payment_terms === term.value
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ payment_terms: term.value })}
                >
                  <div className="font-semibold text-slate-900">{term.label}</div>
                  <div className="text-sm text-slate-600">{term.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Tier */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Client Categorization</h3>
            </div>
            <div className="space-y-3">
              {CLIENT_TIERS.map((tier) => (
                <div
                  key={tier.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.client_tier === tier.value
                      ? `border-slate-400 ${tier.color}`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ client_tier: tier.value })}
                >
                  <div className="font-semibold text-slate-900">{tier.label}</div>
                  <div className="text-sm text-slate-600">{tier.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Additional Notes</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">
                Client preferences, quirks, or important details
              </Label>
              <Textarea
                id="notes"
                value={data.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="e.g., Prefers morning meetings, very detail-oriented, likes weekly progress reports..."
                className="h-24 border-slate-200 focus:border-slate-400 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev} size="lg" className="px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="submit" 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Client...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}