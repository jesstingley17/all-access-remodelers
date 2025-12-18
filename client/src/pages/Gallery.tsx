import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PillarLayout } from "@/components/Pillar";
import { RomanFrieze } from "@/components/RomanFrieze";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@shared/schema";

const categories = ["All", "Kitchen", "Bathroom", "Living Room", "Flooring", "Exterior", "Commercial"];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <PillarLayout className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8f7f5] via-white to-[#f8f7f5]">
      <RomanFrieze />
      <Navigation />
      <Header />

      <main className="flex-1">
        <section className="py-24 pb-20 bg-gradient-to-br from-[#111418] to-[#1C1C1C] text-white text-center" data-testid="section-gallery-hero">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center">
              <span className="inline-block text-[0.8rem] font-semibold text-[#C89B3C] uppercase tracking-[3px] mb-4 opacity-90">
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
                    "px-6 py-2 text-sm font-medium rounded-lg",
                    activeCategory === category
                      ? "bg-[#C89B3C] text-[#111418] border-[#C89B3C]"
                      : "bg-white text-[#4a4a4a] border-[#111418]/20"
                  )}
                  data-testid={`button-filter-${category.toLowerCase().replace(' ', '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[#e5e5e5] aspect-[4/3] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden bg-[#2C2C2C] aspect-[4/3] group cursor-pointer shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    data-testid={`gallery-item-${item.id}`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#9a9a9a] font-medium text-lg">
                        {item.title}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                      <span className="text-white/80 text-sm mt-1">{item.category}</span>
                      {item.description && (
                        <p className="text-white/70 text-xs mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#6a6a6a] text-lg">No projects found in this category.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-24 bg-[#C89B3C] text-[#111418] text-center" data-testid="section-gallery-cta">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-[2.5rem] font-semibold tracking-[-0.5px] leading-[1.2] mb-5">
              Ready to Start Your Project?
            </h2>
            <p className="text-[1.2rem] mb-8 opacity-90 max-w-[580px] mx-auto leading-[1.7]">
              Let's bring your vision to life. Contact us for a free consultation and estimate.
            </p>
            <a
              href="tel:+16146323495"
              className="inline-flex items-center bg-[#111418] text-white px-10 py-4 text-[1.1rem] font-semibold rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-[#1C1C1C]"
              data-testid="link-contact-us"
            >
              Contact Us Today
            </a>
          </div>
        </section>
      </main>

      <RomanFrieze />
      <Footer />
    </PillarLayout>
  );
}
