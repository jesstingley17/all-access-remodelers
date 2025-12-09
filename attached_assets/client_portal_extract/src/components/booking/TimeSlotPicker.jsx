import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { format, addMinutes } from "date-fns";

export default function TimeSlotPicker({ selectedService, selectedDate, onSelectSlot }) {
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(':');
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const duration = selectedService?.default_duration_minutes || 60;
    const endDateTime = addMinutes(selectedDateTime, duration);
    
    onSelectSlot(selectedDateTime.toISOString(), endDateTime.toISOString());
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Select Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
            setSelectedTime(null);
          }}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
      </div>

      <div>
        <Label className="mb-3 block">Available Time Slots</Label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              className={selectedTime === time ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => handleTimeSelect(time)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {time}
            </Button>
          ))}
        </div>
      </div>

      {selectedTime && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-700">
              <strong>Selected:</strong> {format(date, 'MMMM d, yyyy')} at {selectedTime}
            </p>
            {selectedService && (
              <p className="text-sm text-slate-600 mt-1">
                Duration: {selectedService.default_duration_minutes} minutes
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}