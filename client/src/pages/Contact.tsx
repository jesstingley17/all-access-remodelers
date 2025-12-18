import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const serviceOptions = [
  "Residential Remodeling",
  "Property Management",
  "Cleaning Services",
  "General Maintenance",
  "Consultation",
  "Other",
];

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <Header />

      <main className="flex-1">
        <section className="py-24 pb-20 bg-gradient-to-br from-[#111418] to-[#1C1C1C] text-white text-center" data-testid="section-contact-hero">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center">
              <span className="inline-block text-[0.8rem] font-semibold text-[#C89B3C] uppercase tracking-[3px] mb-4 opacity-90">
                Get In Touch
              </span>
              <h2 className="text-[2.75rem] text-white font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Contact Us
              </h2>
              <p className="text-[1.15rem] text-white/90 max-w-[680px] mx-auto leading-[1.7]">
                We're here to help with all your property needs. Send us a message and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </section>

        <section className="py-28 bg-[#fafafa] relative" data-testid="section-contact-form">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-12 max-w-[1000px] mx-auto">
              <Card className="bg-white p-8 rounded-xl shadow-sm border border-[#111418]/8" data-testid="card-contact-form">
                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-6">Send Us a Message</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                              data-testid="input-name"
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
                              data-testid="input-email"
                              className="border-[#111418]/20 focus:border-[#C89B3C]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              data-testid="input-phone"
                              className="border-[#111418]/20 focus:border-[#C89B3C]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#111418]">Service Needed *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                data-testid="select-service"
                                className="border-[#111418]/20 focus:border-[#C89B3C]"
                              >
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceOptions.map((service) => (
                                <SelectItem key={service} value={service}>
                                  {service}
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
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#111418]">Message *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project..."
                              rows={4}
                              {...field}
                              data-testid="input-message"
                              className="border-[#111418]/20 focus:border-[#C89B3C] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={contactMutation.isPending}
                      className="w-full bg-[#C89B3C] text-[#111418] py-3.5 text-base font-semibold rounded-lg shadow-[0_4px_16px_rgba(200,155,60,0.3)] border-[#C89B3C]"
                      data-testid="button-submit-contact"
                    >
                      {contactMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>

              <Card className="bg-[#111418] p-8 rounded-xl shadow-lg text-white relative overflow-hidden border border-white/10" data-testid="card-contact-info">
                <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(200,155,60,0.1)_0%,transparent_70%)] animate-spin-slow" />
                <div className="relative z-10">
                  <h3 className="text-[1.5rem] text-white font-semibold mb-8">Contact Information</h3>
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#C89B3C]/20 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-[#C89B3C]" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Phone</p>
                        <a href="tel:+16146323495" className="text-white font-medium hover:text-[#C89B3C] transition-colors">
                          +1 (614) 632-3495
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#C89B3C]/20 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-[#C89B3C]" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Email</p>
                        <a href="mailto:admin@allaccessremodelers.com" className="text-white font-medium hover:text-[#C89B3C] transition-colors">
                          admin@allaccessremodelers.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#C89B3C]/20 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#C89B3C]" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Location</p>
                        <p className="text-white font-medium">Columbus, Ohio</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/10">
                    <h4 className="text-white font-semibold mb-4">Business Hours</h4>
                    <div className="space-y-2 text-white/80 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="font-medium">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-medium">9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-medium">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

