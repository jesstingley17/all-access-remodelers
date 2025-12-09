import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle } from "lucide-react";
import ServiceSelector from "../components/booking/ServiceSelector";
import TimeSlotPicker from "../components/booking/TimeSlotPicker";
import LocationSelector from "../components/booking/LocationSelector";
import BookingConfirmation from "../components/booking/BookingConfirmation";
import StaffSelector from "../components/booking/StaffSelector";

export default function Booking() {
  const [currentUser, setCurrentUser] = useState(null);
  const [businessMode, setBusinessMode] = useState('construction');
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    service_type_id: null,
    client_location_id: null,
    scheduled_start_at: null,
    scheduled_end_at: null,
    assigned_cleaners: [],
    client_id: null,
    notes_for_team: "",
    price_quote: null
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setBusinessMode(user.business_mode || 'construction');
        loadData(user);
      } catch (e) {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const loadData = async (user) => {
    setIsLoading(true);
    try {
      const userFilter = { created_by: user.email };
      
      if (user.business_mode === 'cleaning') {
        const [servicesData, locationsData, staffData, clientsData] = await Promise.all([
          base44.entities.ServiceType.filter(userFilter),
          base44.entities.ClientLocation.filter(userFilter),
          base44.entities.User.list(),
          base44.entities.CleaningClient.filter(userFilter)
        ]);
        
        setServices(servicesData || []);
        setLocations(locationsData || []);
        setStaff(staffData.filter(s => s.staff_role) || []);
        setClients(clientsData || []);
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
    setIsLoading(false);
  };

  const updateBookingData = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      
      // Create the job
      const job = await base44.entities.CleaningJob.create({
        ...bookingData,
        status: 'scheduled',
        org_id: currentUser.org_id || 'default'
      });

      // Create calendar event
      const service = services.find(s => s.id === bookingData.service_type_id);
      await base44.entities.Event.create({
        title: `${service?.name || 'Cleaning'} - Job Scheduled`,
        start_time: bookingData.scheduled_start_at,
        end_time: bookingData.scheduled_end_at,
        event_type: 'meeting',
        location: bookingData.client_location_id
      });

      setStep(5); // Success step
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    }
    setIsLoading(false);
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Select Service", icon: Calendar },
    { number: 2, title: "Choose Location", icon: Calendar },
    { number: 3, title: "Pick Time", icon: Calendar },
    { number: 4, title: "Assign Staff", icon: Calendar },
    { number: 5, title: "Confirm", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Book a Service</h1>
          <p className="text-slate-600 mt-1">Schedule your cleaning appointment</p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((s, idx) => (
                <React.Fragment key={s.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= s.number ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {step > s.number ? <CheckCircle className="w-5 h-5" /> : s.number}
                    </div>
                    <p className="text-xs mt-2 text-slate-600 hidden md:block">{s.title}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s.number ? 'bg-orange-600' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[step - 1]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <ServiceSelector
                services={services}
                selectedService={bookingData.service_type_id}
                onSelect={(id, price) => {
                  updateBookingData('service_type_id', id);
                  updateBookingData('price_quote', price);
                }}
              />
            )}

            {step === 2 && (
              <LocationSelector
                locations={locations}
                clients={clients}
                selectedLocation={bookingData.client_location_id}
                selectedClient={bookingData.client_id}
                onSelectLocation={(locationId) => updateBookingData('client_location_id', locationId)}
                onSelectClient={(clientId) => updateBookingData('client_id', clientId)}
              />
            )}

            {step === 3 && (
              <TimeSlotPicker
                selectedService={services.find(s => s.id === bookingData.service_type_id)}
                selectedDate={bookingData.scheduled_start_at}
                onSelectSlot={(start, end) => {
                  updateBookingData('scheduled_start_at', start);
                  updateBookingData('scheduled_end_at', end);
                }}
              />
            )}

            {step === 4 && (
              <StaffSelector
                staff={staff}
                selectedStaff={bookingData.assigned_cleaners}
                onSelect={(staffIds) => updateBookingData('assigned_cleaners', staffIds)}
              />
            )}

            {step === 5 && step < 6 && (
              <BookingConfirmation
                bookingData={bookingData}
                service={services.find(s => s.id === bookingData.service_type_id)}
                location={locations.find(l => l.id === bookingData.client_location_id)}
                client={clients.find(c => c.id === bookingData.client_id)}
                staff={staff.filter(s => bookingData.assigned_cleaners?.includes(s.email))}
              />
            )}

            {step === 5 && step >= 6 && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                <p className="text-slate-600 mb-6">Your cleaning appointment has been scheduled successfully.</p>
                <Button onClick={() => window.location.href = '/CleaningJobs'}>
                  View Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {step < 6 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 5 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !bookingData.service_type_id) ||
                  (step === 2 && (!bookingData.client_location_id || !bookingData.client_id)) ||
                  (step === 3 && !bookingData.scheduled_start_at) ||
                  (step === 4 && bookingData.assigned_cleaners.length === 0)
                }
                className="bg-orange-600 hover:bg-orange-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Creating...' : 'Confirm Booking'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}