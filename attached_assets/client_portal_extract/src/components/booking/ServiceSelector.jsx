import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, DollarSign } from "lucide-react";

export default function ServiceSelector({ services, selectedService, onSelect }) {
  return (
    <div className="space-y-4">
      {services.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No services available. Please add services first.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedService === service.id
                  ? 'ring-2 ring-blue-600 bg-blue-50'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => onSelect(service.id, service.default_price)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                    )}
                  </div>
                  {selectedService === service.id && (
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{service.default_duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span>${service.default_price}</span>
                  </div>
                </div>

                {!service.is_active && (
                  <Badge variant="outline" className="mt-3 bg-slate-100">Inactive</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}