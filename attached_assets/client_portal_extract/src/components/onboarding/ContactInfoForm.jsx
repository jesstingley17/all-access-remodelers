import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Plus, Trash2, ArrowRight, ArrowLeft, Phone, Mail, Clock } from "lucide-react";

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", "UTC-07:00",
  "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00", "UTC-02:00", "UTC-01:00",
  "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+04:00", "UTC+05:00",
  "UTC+06:00", "UTC+07:00", "UTC+08:00", "UTC+09:00", "UTC+10:00", "UTC+11:00", "UTC+12:00"
];

export default function ContactInfoForm({ data, onChange, onNext, onPrev }) {
  const [secondaryContacts, setSecondaryContacts] = useState(data.secondary_contacts || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.primary_contact_name && data.primary_contact_email) {
      onChange({ secondary_contacts: secondaryContacts });
      onNext();
    }
  };

  const addSecondaryContact = () => {
    const newContact = { name: "", role: "", email: "", phone: "" };
    const updated = [...secondaryContacts, newContact];
    setSecondaryContacts(updated);
  };

  const removeSecondaryContact = (index) => {
    const updated = secondaryContacts.filter((_, i) => i !== index);
    setSecondaryContacts(updated);
  };

  const updateSecondaryContact = (index, field, value) => {
    const updated = secondaryContacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    );
    setSecondaryContacts(updated);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <User className="w-5 h-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Primary Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Primary Contact</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primary_contact_name" className="text-slate-700 font-medium">
                  Full Name *
                </Label>
                <Input
                  id="primary_contact_name"
                  value={data.primary_contact_name}
                  onChange={(e) => onChange({ primary_contact_name: e.target.value })}
                  placeholder="Enter contact name"
                  className="h-12 border-slate-200 focus:border-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_contact_role" className="text-slate-700 font-medium">
                  Job Title
                </Label>
                <Input
                  id="primary_contact_role"
                  value={data.primary_contact_role}
                  onChange={(e) => onChange({ primary_contact_role: e.target.value })}
                  placeholder="e.g., CEO, Marketing Manager"
                  className="h-12 border-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_contact_email" className="text-slate-700 font-medium">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="primary_contact_email"
                    type="email"
                    value={data.primary_contact_email}
                    onChange={(e) => onChange({ primary_contact_email: e.target.value })}
                    placeholder="contact@company.com"
                    className="h-12 pl-10 border-slate-200 focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_contact_phone" className="text-slate-700 font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="primary_contact_phone"
                    type="tel"
                    value={data.primary_contact_phone}
                    onChange={(e) => onChange({ primary_contact_phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 pl-10 border-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-slate-700 font-medium">
                  Timezone
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Select value={data.timezone} onValueChange={(value) => onChange({ timezone: value })}>
                    <SelectTrigger className="h-12 pl-10 border-slate-200 focus:border-slate-400">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Secondary Contacts</h3>
              <Button type="button" variant="outline" onClick={addSecondaryContact}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {secondaryContacts.length > 0 ? (
              <div className="space-y-4">
                {secondaryContacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-700">Contact {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSecondaryContact(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full name"
                        value={contact.name}
                        onChange={(e) => updateSecondaryContact(index, 'name', e.target.value)}
                        className="border-slate-200"
                      />
                      <Input
                        placeholder="Job title"
                        value={contact.role}
                        onChange={(e) => updateSecondaryContact(index, 'role', e.target.value)}
                        className="border-slate-200"
                      />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={contact.email}
                        onChange={(e) => updateSecondaryContact(index, 'email', e.target.value)}
                        className="border-slate-200"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        value={contact.phone}
                        onChange={(e) => updateSecondaryContact(index, 'phone', e.target.value)}
                        className="border-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No secondary contacts added yet. Click "Add Contact" to include additional team members.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev} size="lg" className="px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="submit" 
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8"
              disabled={!data.primary_contact_name || !data.primary_contact_email}
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