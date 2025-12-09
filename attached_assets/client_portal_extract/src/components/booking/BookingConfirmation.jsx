import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";

export default function BookingConfirmation({ bookingData, service, location, client, staff }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-2">Review Your Booking</h3>
        <p className="text-sm text-slate-600">
          Please review all details before confirming your appointment
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Service</h4>
              <p className="text-slate-700 mt-1">{service?.name || 'N/A'}</p>
              {service?.description && (
                <p className="text-sm text-slate-600 mt-1">{service.description}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Location</h4>
              <p className="text-slate-700 mt-1">{location?.label || 'N/A'}</p>
              <p className="text-sm text-slate-600">
                {location?.address_line1}
                {location?.address_line2 && `, ${location.address_line2}`}
              </p>
              <p className="text-sm text-slate-600">
                {location?.city}, {location?.state} {location?.postal_code}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Date & Time</h4>
              {bookingData.scheduled_start_at ? (
                <>
                  <p className="text-slate-700 mt-1">
                    {format(new Date(bookingData.scheduled_start_at), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(bookingData.scheduled_start_at), 'h:mm a')} - 
                    {format(new Date(bookingData.scheduled_end_at), 'h:mm a')}
                  </p>
                  <p className="text-sm text-slate-600">
                    Duration: {service?.default_duration_minutes || 0} minutes
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Not selected</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Assigned Staff</h4>
              {staff.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {staff.map((member) => (
                    <Badge key={member.email} variant="outline">
                      {member.full_name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 mt-1">No staff assigned</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Price</h4>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${bookingData.price_quote || service?.default_price || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          By confirming this booking, you agree to the service terms and conditions. 
          You will receive a confirmation email shortly after booking.
        </p>
      </div>
    </div>
  );
}