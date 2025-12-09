import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Globe, MapPin, User } from "lucide-react";

export default function ContactInformation({ client }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.primary_contact_name && (
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Primary Contact</div>
              <div className="font-medium text-slate-900">{client.primary_contact_name}</div>
            </div>
          </div>
        )}

        {client.primary_contact_email && (
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Email</div>
              <a href={`mailto:${client.primary_contact_email}`} className="font-medium text-blue-600 hover:underline">
                {client.primary_contact_email}
              </a>
            </div>
          </div>
        )}

        {client.primary_contact_phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Phone</div>
              <a href={`tel:${client.primary_contact_phone}`} className="font-medium text-blue-600 hover:underline">
                {client.primary_contact_phone}
              </a>
            </div>
          </div>
        )}

        {client.website && (
          <div className="flex items-start gap-3">
            <Globe className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Website</div>
              <a href={client.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                {client.website}
              </a>
            </div>
          </div>
        )}

        {client.timezone && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Timezone</div>
              <div className="font-medium text-slate-900">{client.timezone}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}