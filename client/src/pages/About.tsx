import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Users, Award, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To provide exceptional property services that transform houses into homes and spaces into places where memories are made.",
  },
  {
    icon: Users,
    title: "Our Team",
    description: "Skilled professionals with years of experience in construction, property management, and cleaning services.",
  },
  {
    icon: Award,
    title: "Quality First",
    description: "We never compromise on quality. Every project receives our full attention and commitment to excellence.",
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We listen, understand, and deliver results that exceed expectations.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <Header />

      <main className="flex-1">
        <section className="py-24 pb-20 bg-gradient-to-br from-[#1a3a5c] to-[#0d2a42] text-white text-center" data-testid="section-about-hero">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center">
              <span className="inline-block text-[0.8rem] font-semibold text-[#ff6b35] uppercase tracking-[3px] mb-4 opacity-90">
                Who We Are
              </span>
              <h2 className="text-[2.75rem] text-white font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                About All Access Remodelers
              </h2>
              <p className="text-[1.15rem] text-white/90 max-w-[680px] mx-auto leading-[1.7]">
                Building trust through quality work and exceptional service since day one.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#fafafa]" data-testid="section-about-story">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="max-w-[800px] mx-auto">
              <Card className="bg-white p-12 rounded-xl shadow-sm border border-[#1a3a5c]/8" data-testid="card-story">
                <h3 className="text-[2rem] text-[#1a3a5c] font-semibold tracking-[-0.3px] mb-6 text-center">
                  Our Story
                </h3>
                <div className="text-[#4a4a4a] leading-[1.9] text-[1.05rem] space-y-6">
                  <p>
                    Hi, my name is Ali. I grew up in a family of 7 siblings and worked alongside my father in construction since I was a child. The lessons he taught me about hard work, integrity, and quality craftsmanship have been the foundation of everything I do.
                  </p>
                  <p>
                    When I started All Access Remodelers, I wanted to build more than just a business. I wanted to create a company that treats every client like family, every project like it's our own home, and every promise like a sacred commitment.
                  </p>
                  <p>
                    Over the years, we've expanded our services to include property management and cleaning, but our core values remain unchanged. We believe in doing things right the first time, communicating openly with our clients, and standing behind our work.
                  </p>
                  <p>
                    Whether you need a complete home renovation, reliable property management, or thorough cleaning services, we're here to help. Thank you for considering All Access Remodelers for your property needs.
                  </p>
                </div>
                <div className="mt-8 text-right">
                  <p className="text-[#1a3a5c] font-semibold text-lg">- Ali</p>
                  <p className="text-[#6a6a6a] text-sm">Founder, All Access Remodelers</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white" data-testid="section-about-values">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center mb-16">
              <span className="inline-block text-[0.8rem] font-semibold text-[#ff6b35] uppercase tracking-[3px] mb-4 opacity-90">
                What Drives Us
              </span>
              <h2 className="text-[2.75rem] text-[#1a3a5c] font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Our Values
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="bg-white p-10 rounded-xl shadow-sm text-center transition-all duration-400 relative overflow-visible border border-[#1a3a5c]/8 group hover:-translate-y-2 hover:shadow-lg hover:border-[#ff6b35]/20"
                  data-testid={`card-value-${index}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ff6b35] transform scale-x-0 transition-transform duration-400 group-hover:scale-x-100 origin-left" />
                  <div className="bg-[#fafafa] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110">
                    <value.icon className="w-10 h-10 text-[#1a3a5c]" />
                  </div>
                  <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold tracking-[-0.3px] mb-4">
                    {value.title}
                  </h3>
                  <p className="text-[#4a4a4a] leading-[1.8] text-base font-normal">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#1a3a5c] text-white text-center" data-testid="section-about-cta">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-[2.5rem] font-semibold tracking-[-0.5px] leading-[1.2] mb-5">
              Ready to Get Started?
            </h2>
            <p className="text-[1.2rem] mb-8 opacity-90 max-w-[580px] mx-auto leading-[1.7]">
              Contact us today to discuss your project and receive a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+16146323495"
                className="inline-flex items-center bg-[#ff6b35] text-white px-8 py-4 text-[1rem] font-semibold rounded-lg transition-all duration-300 shadow-[0_4px_16px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 hover:bg-[#e55a2b]"
                data-testid="link-call-us"
              >
                Call Us: +1 (614) 632-3495
              </a>
              <a
                href="mailto:admin@allaccessremodelers.com"
                className="inline-flex items-center bg-transparent text-white px-8 py-4 text-[1rem] font-semibold rounded-lg border-2 border-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/50"
                data-testid="link-email-us"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
