import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, ArrowRight } from "lucide-react";

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-10 employees)" },
  { value: "small", label: "Small (11-50 employees)" },
  { value: "medium", label: "Medium (51-200 employees)" },
  { value: "large", label: "Large (201-1000 employees)" },
  { value: "enterprise", label: "Enterprise (1000+ employees)" }
];

export default function CompanyInfoForm({ data, onChange, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.company_name && data.industry) {
      onNext();
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Building2 className="w-5 h-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-slate-700 font-medium">
                Company Name *
              </Label>
              <Input
                id="company_name"
                value={data.company_name}
                onChange={(e) => onChange({ company_name: e.target.value })}
                placeholder="Enter company name"
                className="h-12 border-slate-200 focus:border-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-slate-700 font-medium">
                Industry *
              </Label>
              <Input
                id="industry"
                value={data.industry}
                onChange={(e) => onChange({ industry: e.target.value })}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="h-12 border-slate-200 focus:border-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size" className="text-slate-700 font-medium">
                Company Size
              </Label>
              <Select value={data.company_size} onValueChange={(value) => onChange({ company_size: value })}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-slate-400">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-700 font-medium">
                Website
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="website"
                  type="url"
                  value={data.website}
                  onChange={(e) => onChange({ website: e.target.value })}
                  placeholder="https://company.com"
                  className="h-12 pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8"
              disabled={!data.company_name || !data.industry}
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}