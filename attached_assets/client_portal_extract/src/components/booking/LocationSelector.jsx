import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function LocationSelector({ 
  locations, 
  clients, 
  selectedLocation, 
  selectedClient,
  onSelectLocation,
  onSelectClient 
}) {
  const [filteredLocations, setFilteredLocations] = useState(locations);

  const handleClientChange = (clientId) => {
    onSelectClient(clientId);
    const clientLocations = locations.filter(l => l.client_id === clientId);
    setFilteredLocations(clientLocations);
    if (clientLocations.length > 0 && !clientLocations.find(l => l.id === selectedLocation)) {
      onSelectLocation(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Select Client</Label>
        <Select value={selectedClient || ""} onValueChange={handleClientChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} - {client.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <div>
          <Label>Select Location</Label>
          {filteredLocations.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">No locations found for this client.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 mt-2">
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedLocation === location.id
                      ? 'ring-2 ring-blue-600 bg-blue-50'
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => onSelectLocation(location.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-slate-900">{location.label}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {location.address_line1}
                            {location.address_line2 && `, ${location.address_line2}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            {location.city}, {location.state} {location.postal_code}
                          </p>
                          {location.access_instructions && (
                            <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                              Access: {location.access_instructions}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedLocation === location.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}