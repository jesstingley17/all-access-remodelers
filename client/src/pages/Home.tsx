import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Building2, Home as HomeIcon, Sparkles, Phone, Mail, Loader2, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact, type Testimonial } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const services = [
  {
    icon: Building2,
    title: "Residential Remodeling & Renovations",
    description: "Complete residential remodeling and renovation services including:",
    items: ["Design", "Painting", "Flooring", "Tile", "Carpentry", "General Maintenance"],
  },
  {
    icon: HomeIcon,
    title: "Property Management",
    description: "Comprehensive property management services including:",
    items: ["On-Call Maintenance", "Rental Showings", "Move Out/Move In Turnovers"],
  },
  {
    icon: Sparkles,
    title: "Cleaning Services",
    description: "Professional cleaning solutions for residential properties:",
    items: ["Basic Residential Cleans", "Interior Deep Cleans", "Outdoor/Indoor Debris Removal"],
  },
];

const galleryItems = [
  { title: "Kitchen Renovation", placeholder: "Kitchen Renovation" },
  { title: "Bathroom Remodel", placeholder: "Bathroom Remodel" },
  { title: "Living Room Renovation", placeholder: "Living Room" },
  { title: "Floor Installation", placeholder: "Floor Installation" },
  { title: "Construction Work", placeholder: "Construction" },
  { title: "Interior Renovation", placeholder: "Interior Design" },
];

const serviceOptions = [
  "Residential Remodeling",
  "Property Management",
  "Cleaning Services",
  "General Maintenance",
  "Consultation",
  "Other",
];

export default function Home() {
  const { toast } = useToast();

  const { data: testimonials = [], isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });
  
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
        <section className="relative bg-gradient-to-br from-[#111418] to-[#1C1C1C] text-white py-36 text-center overflow-hidden min-h-[650px] flex items-center" data-testid="section-hero">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(200,155,60,0.12)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_70%,rgba(200,155,60,0.08)_0%,transparent_60%)]" />
          </div>
          <div className="max-w-[1200px] mx-auto px-5 relative z-10">
            <div className="max-w-[850px] mx-auto animate-fade-in-up">
              <h2 className="text-[3.25rem] font-semibold leading-[1.25] tracking-[-0.5px] mb-7 text-white" data-testid="hero-title">
                Your Trusted Partner for All Your Property Needs
              </h2>
              <p className="text-[1.3rem] opacity-92 mb-12 leading-[1.75] font-normal text-white/95">
                Professional construction, property management, and cleaning services you can rely on.
              </p>
              <div className="flex gap-5 justify-center flex-wrap">
                <Button
                  asChild
                  className="gold-shine text-[#111418] px-8 py-3.5 text-base font-semibold rounded-lg border-[#C89B3C] relative z-0"
                  data-testid="button-get-started"
                >
                  <a href="#contact">Get Started</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 text-white border-2 border-white/30 backdrop-blur-sm px-8 py-3.5 text-base font-semibold rounded-lg"
                  data-testid="button-our-services"
                >
                  <a href="#services">Our Services</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-28 bg-[#fafafa] relative" data-testid="section-services">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold gold-text uppercase tracking-[3px] mb-4 opacity-90">
                What We Offer
              </span>
              <h2 className="text-[2.75rem] text-[#111418] font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Our Services
              </h2>
              <p className="text-[1.15rem] text-[#4a4a4a] max-w-[580px] mx-auto leading-[1.7]">
                Comprehensive solutions for all your property needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 mt-12">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="bg-white p-10 rounded-xl shadow-sm text-center transition-all duration-400 relative overflow-visible border border-[#111418]/8 group hover:-translate-y-2 hover:shadow-lg hover:border-[#C89B3C]/20"
                  data-testid={`card-service-${index}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] gold-shine transform scale-x-0 transition-transform duration-400 group-hover:scale-x-100 origin-left" />
                  <div className="relative w-full h-[200px] mb-6 rounded-lg overflow-hidden bg-[#fafafa] flex items-center justify-center">
                    <div className="bg-white/95 rounded-full w-20 h-20 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110">
                      <service.icon className="w-10 h-10 text-[#111418]" />
                    </div>
                  </div>
                  <h3 className="text-[1.5rem] text-[#111418] font-semibold tracking-[-0.3px] mb-4">
                    {service.title}
                  </h3>
                  <p className="text-[#4a4a4a] leading-[1.8] text-base font-normal mb-4">
                    {service.description}
                  </p>
                  <ul className="text-left list-none p-0 m-0">
                    {service.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                          className="text-[#4a4a4a] text-[0.95rem] leading-[1.8] py-1.5 pl-6 relative before:content-['•'] before:gold-text before:font-bold before:absolute before:left-2 before:text-[1.2rem]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-28 bg-white relative" data-testid="section-testimonials">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold gold-text uppercase tracking-[3px] mb-4 opacity-90">
                Testimonials
              </span>
              <h2 className="text-[2.75rem] text-[#111418] font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                What Our Clients Say
              </h2>
              <p className="text-[1.15rem] text-[#4a4a4a] max-w-[580px] mx-auto leading-[1.7]">
                Hear from homeowners who have trusted us with their projects
              </p>
            </div>
            {isLoadingTestimonials ? (
              <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin gold-text" />
              </div>
            ) : testimonials.length === 0 ? (
              <p className="text-center text-[#4a4a4a]">No testimonials yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <Card
                    key={testimonial.id}
                    className="bg-white p-8 rounded-xl shadow-sm border border-[#111418]/8 relative group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    data-testid={`card-testimonial-${testimonial.id}`}
                  >
                    <Quote className="absolute top-6 right-6 w-10 h-10 text-[#C89B3C]/15" />
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? "text-[#C89B3C] fill-[#C89B3C]"
                              : "text-[#ddd]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[#4a4a4a] leading-[1.8] text-base mb-6 relative z-10">
                      "{testimonial.text}"
                    </p>
                    <div className="border-t border-[#111418]/8 pt-5">
                      <p className="font-semibold text-[#111418] text-lg" data-testid={`text-testimonial-name-${testimonial.id}`}>
                        {testimonial.name}
                      </p>
                      {testimonial.location && (
                        <p className="text-[#4a4a4a] text-sm">{testimonial.location}</p>
                      )}
                      {testimonial.service && (
                        <p className="gold-text text-sm font-medium mt-1">
                          {testimonial.service}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="contact" className="py-28 bg-[#fafafa] relative" data-testid="section-contact">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold gold-text uppercase tracking-[3px] mb-4 opacity-90">
                Contact Us
              </span>
              <h2 className="text-[2.75rem] text-[#111418] font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Get In Touch
              </h2>
              <p className="text-[1.15rem] text-[#4a4a4a] max-w-[580px] mx-auto leading-[1.7]">
                We're here to help with all your property needs
              </p>
            </div>

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
                              className="border-[#111418]/20 focus:border-[#C89B3C] focus:gold-border-shine"
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
                              className="border-[#111418]/20 focus:border-[#C89B3C] focus:gold-border-shine"
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
                              className="border-[#111418]/20 focus:border-[#C89B3C] focus:gold-border-shine"
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
                                className="border-[#111418]/20 focus:border-[#C89B3C] focus:gold-border-shine"
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
                      className="w-full gold-shine text-[#111418] py-3.5 text-base font-semibold rounded-lg border-[#C89B3C] relative z-0"
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
                        <Phone className="w-6 h-6 gold-text" />
                      </div>
                      <div>
                        <span className="block font-medium text-white/70 text-sm uppercase tracking-[1px] mb-1">
                          Phone Number
                        </span>
                        <a
                          href="tel:+16146323495"
                          className="text-lg text-white font-semibold transition-colors duration-300 hover:gold-text"
                          data-testid="link-phone"
                        >
                          +1 (614) 632-3495
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#C89B3C]/20 flex items-center justify-center">
                        <Mail className="w-6 h-6 gold-text" />
                      </div>
                      <div>
                        <span className="block font-medium text-white/70 text-sm uppercase tracking-[1px] mb-1">
                          Email Address
                        </span>
                        <a
                          href="mailto:admin@allaccessremodelers.com"
                          className="text-lg text-white font-semibold transition-colors duration-300 break-words hover:text-[#C89B3C]"
                          data-testid="link-email"
                        >
                          admin@allaccessremodelers.com
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/10">
                    <p className="text-white/70 text-base leading-relaxed">
                      Reach out to us for a free consultation! We'll respond within 24 hours to discuss your project.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-28 bg-[#fafafa]" data-testid="section-gallery-preview">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold gold-text uppercase tracking-[3px] mb-4 opacity-90">
                Our Work
              </span>
              <h2 className="text-[2.75rem] text-[#111418] font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Recent Projects
              </h2>
              <p className="text-[1.15rem] text-[#4a4a4a] max-w-[580px] mx-auto leading-[1.7]">
                See examples of our quality craftsmanship and attention to detail
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden bg-[#2C2C2C] aspect-[4/3] group cursor-pointer"
                  data-testid={`gallery-item-${index}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[#9a9a9a] font-medium text-lg">
                    {item.placeholder}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button
                asChild
                className="gold-shine text-[#111418] px-8 py-3.5 text-base font-semibold rounded-lg border-[#C89B3C] relative z-0"
                data-testid="button-view-gallery"
              >
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
