import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = ["All", "Kitchen", "Bathroom", "Living Room", "Flooring", "Exterior", "Commercial"];

const galleryItems = [
  { id: 1, title: "Modern Kitchen Renovation", category: "Kitchen", placeholder: "Kitchen Renovation" },
  { id: 2, title: "Luxury Bathroom Remodel", category: "Bathroom", placeholder: "Bathroom Remodel" },
  { id: 3, title: "Open Concept Living Room", category: "Living Room", placeholder: "Living Room" },
  { id: 4, title: "Hardwood Floor Installation", category: "Flooring", placeholder: "Floor Installation" },
  { id: 5, title: "Custom Kitchen Cabinets", category: "Kitchen", placeholder: "Custom Cabinets" },
  { id: 6, title: "Master Bath Renovation", category: "Bathroom", placeholder: "Master Bath" },
  { id: 7, title: "Laminate Flooring", category: "Flooring", placeholder: "Laminate Flooring" },
  { id: 8, title: "Contemporary Living Space", category: "Living Room", placeholder: "Living Space" },
  { id: 9, title: "Exterior Siding", category: "Exterior", placeholder: "Exterior Siding" },
  { id: 10, title: "Commercial Office Renovation", category: "Commercial", placeholder: "Office Renovation" },
  { id: 11, title: "Kitchen Island Installation", category: "Kitchen", placeholder: "Kitchen Island" },
  { id: 12, title: "Tile Bathroom Floor", category: "Bathroom", placeholder: "Bathroom Tile" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <Header />

      <main className="flex-1">
        <section className="py-24 pb-20 bg-gradient-to-br from-[#1a3a5c] to-[#0d2a42] text-white text-center" data-testid="section-gallery-hero">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center">
              <span className="inline-block text-[0.8rem] font-semibold text-[#ff6b35] uppercase tracking-[3px] mb-4 opacity-90">
                Our Portfolio
              </span>
              <h2 className="text-[2.75rem] text-white font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
                Project Gallery
              </h2>
              <p className="text-[1.15rem] text-white/90 max-w-[680px] mx-auto leading-[1.7]">
                Browse through our completed projects showcasing quality craftsmanship and attention to detail.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#fafafa]" data-testid="section-gallery-grid">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    activeCategory === category
                      ? "bg-[#ff6b35] text-white border-[#ff6b35] hover:bg-[#e55a2b]"
                      : "bg-white text-[#4a4a4a] border-[#1a3a5c]/20 hover:border-[#ff6b35] hover:text-[#ff6b35]"
                  )}
                  data-testid={`button-filter-${category.toLowerCase().replace(' ', '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-lg overflow-hidden bg-[#e0e0e0] aspect-[4/3] group cursor-pointer shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  data-testid={`gallery-item-${item.id}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[#6a6a6a] font-medium text-lg">
                    {item.placeholder}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                    <span className="text-white/80 text-sm mt-1">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#6a6a6a] text-lg">No projects found in this category.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-24 bg-[#ff6b35] text-white text-center" data-testid="section-gallery-cta">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-[2.5rem] font-semibold tracking-[-0.5px] leading-[1.2] mb-5">
              Ready to Start Your Project?
            </h2>
            <p className="text-[1.2rem] mb-8 opacity-95 max-w-[580px] mx-auto leading-[1.7]">
              Let's bring your vision to life. Contact us for a free consultation and estimate.
            </p>
            <a
              href="tel:+16146323495"
              className="inline-flex items-center bg-white text-[#1a3a5c] px-10 py-4 text-[1.1rem] font-semibold rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-[#fafafa]"
              data-testid="link-contact-us"
            >
              Contact Us Today
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
