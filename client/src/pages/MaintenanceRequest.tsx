import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMaintenanceRequestSchema, type InsertMaintenanceRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const issueTypes = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliances",
  "Roofing",
  "Flooring",
  "Paint & Drywall",
  "Doors & Windows",
  "Pest Control",
  "Landscaping",
  "Other",
];

const urgencyLevels = [
  { value: "low", label: "Low - Can wait a few days" },
  { value: "medium", label: "Medium - Needs attention within 24-48 hours" },
  { value: "high", label: "High - Needs immediate attention" },
  { value: "emergency", label: "Emergency - Urgent repair needed" },
];

const contactTimeOptions = [
  "Morning (8am - 12pm)",
  "Afternoon (12pm - 5pm)",
  "Evening (5pm - 8pm)",
  "Any time",
];

export default function MaintenanceRequest() {
  const { toast } = useToast();

  const form = useForm<InsertMaintenanceRequest>({
    resolver: zodResolver(insertMaintenanceRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      propertyAddress: "",
      issueType: "",
      description: "",
      urgency: "",
      preferredContactTime: "",
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: async (data: InsertMaintenanceRequest) => {
      const response = await apiRequest("POST", "/api/maintenance-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Maintenance Request Submitted!",
        description: "We've received your request and will contact you soon.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit maintenance request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMaintenanceRequest) => {
    maintenanceMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header />
      <Navigation />
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-[#111418] to-[#1a1e23] py-16">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#C89B3C]/20 flex items-center justify-center">
                  <Wrench className="w-10 h-10 text-[#C89B3C]" />
                </div>
              </div>
              <h1 className="text-[2.5rem] md:text-[3rem] text-white font-bold mb-4">
                Maintenance Request
              </h1>
              <p className="text-[1.15rem] text-gray-300 max-w-[580px] mx-auto leading-[1.7]">
                Submit a maintenance request for your property. We'll get back to you as soon as possible.
              </p>
            </div>

            <div className="max-w-[800px] mx-auto">
              <Card className="bg-white p-8 rounded-xl shadow-lg border border-[#111418]/8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#111418]">Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your name" 
                                {...field} 
                                className="border-[#111418]/20 focus:border-[#C89B3C]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#111418]">Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="your@email.com" 
                                {...field} 
                                className="border-[#111418]/20 focus:border-[#C89B3C]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#111418]">Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(555) 123-4567" 
                                {...field} 
                                value={field.value ?? ""}
                                className="border-[#111418]/20 focus:border-[#C89B3C]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#111418]">Urgency Level *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-[#111418]/20 focus:border-[#C89B3C]">
                                  <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {urgencyLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="propertyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#111418]">Property Address *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123 Main St, City, State ZIP" 
                              {...field} 
                              className="border-[#111418]/20 focus:border-[#C89B3C]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issueType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#111418]">Issue Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-[#111418]/20 focus:border-[#C89B3C]">
                                <SelectValue placeholder="Select issue type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {issueTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#111418]">Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe the maintenance issue in detail..."
                              rows={5}
                              {...field}
                              className="border-[#111418]/20 focus:border-[#C89B3C] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredContactTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#111418]">Preferred Contact Time (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-[#111418]/20 focus:border-[#C89B3C]">
                                <SelectValue placeholder="Select preferred time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contactTimeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={maintenanceMutation.isPending}
                      className="w-full bg-[#C89B3C] text-[#111418] py-3.5 text-base font-semibold rounded-lg shadow-[0_4px_16px_rgba(200,155,60,0.3)] border-[#C89B3C] hover:bg-[#B88A2C]"
                    >
                      {maintenanceMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Maintenance Request"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

