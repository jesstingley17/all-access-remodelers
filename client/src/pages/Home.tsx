import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Building2, Home as HomeIcon, Sparkles, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

export default function Home() {
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
                  className="bg-[#C89B3C] text-[#111418] px-8 py-3.5 text-base font-semibold rounded-lg shadow-[0_4px_16px_rgba(200,155,60,0.3)] border-[#C89B3C]"
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
              <span className="inline-block text-[0.8rem] font-semibold text-[#C89B3C] uppercase tracking-[3px] mb-4 opacity-90">
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
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#C89B3C] transform scale-x-0 transition-transform duration-400 group-hover:scale-x-100 origin-left" />
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
                        className="text-[#4a4a4a] text-[0.95rem] leading-[1.8] py-1.5 pl-6 relative before:content-['•'] before:text-[#C89B3C] before:font-bold before:absolute before:left-2 before:text-[1.2rem]"
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

        <section id="contact" className="py-28 bg-white relative" data-testid="section-contact">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold text-[#C89B3C] uppercase tracking-[3px] mb-4 opacity-90">
                Contact Us
              </span>
              <h2 className="text-[2.75rem] text-[#111418] font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Get In Touch
              </h2>
              <p className="text-[1.15rem] text-[#4a4a4a] max-w-[580px] mx-auto leading-[1.7]">
                We're here to help with all your property needs
              </p>
            </div>
            <Card className="max-w-[700px] mx-auto bg-[#111418] p-16 rounded-2xl shadow-lg text-white text-center relative overflow-hidden border border-white/10" data-testid="card-contact">
              <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(200,155,60,0.1)_0%,transparent_70%)] animate-spin-slow" />
              <div className="relative z-10 flex flex-col gap-8 mb-8">
                <div className="flex items-center justify-center gap-6">
                  <Phone className="w-12 h-12 drop-shadow-lg text-[#C89B3C]" />
                  <div className="text-left">
                    <span className="block font-medium text-white/80 text-[0.95rem] uppercase tracking-[1px] mb-2">
                      Phone Number
                    </span>
                    <a
                      href="tel:+16146323495"
                      className="text-[1.5rem] text-white font-semibold transition-all duration-300 block tracking-[0.3px] hover:text-[#C89B3C] hover:-translate-y-0.5"
                      data-testid="link-phone"
                    >
                      +1 (614) 632-3495
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <Mail className="w-12 h-12 drop-shadow-lg text-[#C89B3C]" />
                  <div className="text-left">
                    <span className="block font-medium text-white/80 text-[0.95rem] uppercase tracking-[1px] mb-2">
                      Email Address
                    </span>
                    <a
                      href="mailto:admin@allaccessremodelers.com"
                      className="text-[1.5rem] text-white font-semibold transition-all duration-300 block tracking-[0.3px] break-words hover:text-[#C89B3C] hover:-translate-y-0.5"
                      data-testid="link-email"
                    >
                      admin@allaccessremodelers.com
                    </a>
                  </div>
                </div>
              </div>
              <p className="relative z-10 mt-6 text-white/85 text-base font-normal">
                Call or email us today for a free consultation!
              </p>
            </Card>
          </div>
        </section>

        <section className="py-28 bg-[#fafafa]" data-testid="section-gallery-preview">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold text-[#C89B3C] uppercase tracking-[3px] mb-4 opacity-90">
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
                className="bg-[#C89B3C] text-[#111418] px-8 py-3.5 text-base font-semibold rounded-lg shadow-[0_4px_16px_rgba(200,155,60,0.3)] border-[#C89B3C]"
                data-testid="button-view-gallery"
              >
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-28 bg-[#C89B3C] text-[#111418] text-center relative overflow-hidden" data-testid="section-client-portal">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
          <div className="max-w-[1200px] mx-auto px-5 relative z-10">
            <h2 className="text-[2.75rem] font-semibold tracking-[-0.5px] leading-[1.2] mb-5">
              Client Portal
            </h2>
            <p className="text-[1.2rem] mb-11 opacity-90 max-w-[580px] mx-auto leading-[1.7]">
              Access your account, view project updates, and manage your services.
            </p>
            <a
              href="https://allaccessremodelers-portal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#111418] text-white px-10 py-4 text-[1.1rem] font-semibold rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-2 border-transparent tracking-[0.5px] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-[#1C1C1C] group"
              data-testid="link-client-portal"
            >
              Access Client Portal
              <ArrowRight className="ml-3 text-2xl transition-transform duration-300 group-hover:translate-x-2" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
