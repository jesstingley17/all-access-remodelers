
import React, { useState } from "react";
import { Client } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CompanyInfoForm from "../components/onboarding/CompanyInfoForm";
import ContactInfoForm from "../components/onboarding/ContactInfoForm";
import CommunicationForm from "../components/onboarding/CommunicationForm";
import BusinessDetailsForm from "../components/onboarding/BusinessDetailsForm";

const STEPS = [
  { id: 'company', title: 'Company Information', description: 'Basic company details' },
  { id: 'contact', title: 'Contact Information', description: 'Primary and secondary contacts' },
  { id: 'communication', title: 'Communication Preferences', description: 'How and when to communicate' },
  { id: 'business', title: 'Business Details', description: 'Budget and payment terms' }
];

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState({
    company_name: "",
    industry: "",
    company_size: "small",
    website: "",
    primary_contact_name: "",
    primary_contact_role: "",
    primary_contact_email: "",
    primary_contact_phone: "",
    timezone: "",
    secondary_contacts: [],
    communication_methods: [],
    communication_frequency: "weekly",
    communication_style: "professional",
    business_hours_start: "09:00",
    business_hours_end: "17:00",
    meeting_availability: [],
    budget_range: "5k-15k",
    payment_terms: "net_30",
    client_tier: "B",
    notes: "",
    relationship_status: "prospect"
  });

  const updateClientData = (updates) => {
    setClientData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await Client.create(clientData);
      navigate(createPageUrl("ClientList"));
    } catch (error) {
      console.error("Error creating client:", error);
    }
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CompanyInfoForm 
            data={clientData} 
            onChange={updateClientData}
            onNext={nextStep}
          />
        );
      case 1:
        return (
          <ContactInfoForm 
            data={clientData} 
            onChange={updateClientData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 2:
        return (
          <CommunicationForm 
            data={clientData} 
            onChange={updateClientData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <BusinessDetailsForm 
            data={clientData} 
            onChange=  {updateClientData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("ClientList")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Client</h1>
            <p className="text-slate-600 mt-1 font-medium">Complete the onboarding process to set up your client profile</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Step {currentStep + 1} of {STEPS.length}</CardTitle>
              <div className="text-sm text-slate-500 font-medium">
                {((currentStep + 1) / STEPS.length * 100).toFixed(0)}% Complete
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-slate-600 to-slate-800 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="hidden md:block">
                      <div className={`font-medium text-sm ${
                        index <= currentStep ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {renderStepContent()}
      </div>
    </div>
  );
}
