import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function TermsConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <Header />

      <main className="flex-1">
        <section className="py-24 pb-20 bg-gradient-to-br from-[#1a3a5c] to-[#0d2a42] text-white text-center" data-testid="section-terms-hero">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-[2.75rem] text-white font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
              Terms & Conditions
            </h2>
            <p className="text-[1.15rem] text-white/90 max-w-[680px] mx-auto leading-[1.7]">
              Last updated: December 2024
            </p>
          </div>
        </section>

        <section className="py-24 bg-[#fafafa]" data-testid="section-terms-content">
          <div className="max-w-[900px] mx-auto px-5">
            <Card className="bg-white p-12 rounded-xl shadow-sm border border-[#1a3a5c]/8" data-testid="card-terms-content">
              <div className="prose prose-lg max-w-none text-[#4a4a4a]">
                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4">Agreement to Terms</h3>
                <p className="leading-[1.8] mb-6">
                  By accessing or using the services provided by All Access Remodelers, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.
                </p>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Services</h3>
                <p className="leading-[1.8] mb-6">
                  All Access Remodelers provides construction, property management, and cleaning services. The specific terms, scope, and pricing of each project will be outlined in a separate written agreement or estimate provided before work begins.
                </p>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Estimates and Pricing</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>All estimates are valid for 30 days from the date provided</li>
                  <li>Final pricing may vary based on actual conditions discovered during work</li>
                  <li>Any changes to the project scope must be agreed upon in writing</li>
                  <li>Additional work beyond the original scope will be quoted separately</li>
                </ul>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Payment Terms</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Payment schedules will be outlined in the project agreement</li>
                  <li>A deposit may be required to begin work</li>
                  <li>Final payment is due upon completion of the project</li>
                  <li>Late payments may incur additional fees</li>
                </ul>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Warranties</h3>
                <p className="leading-[1.8] mb-6">
                  We stand behind our work and offer warranties on our craftsmanship. Specific warranty terms will be provided in writing for each project. Warranties do not cover damage caused by misuse, neglect, or normal wear and tear.
                </p>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Liability</h3>
                <p className="leading-[1.8] mb-6">
                  All Access Remodelers maintains appropriate insurance coverage for our work. Our liability is limited to the scope of work agreed upon in the project contract. We are not responsible for pre-existing conditions not disclosed before work begins.
                </p>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Cancellation Policy</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Cancellations must be made in writing</li>
                  <li>Deposits may be non-refundable depending on work already completed</li>
                  <li>Materials ordered specifically for your project may not be refundable</li>
                </ul>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Modifications</h3>
                <p className="leading-[1.8] mb-6">
                  We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services constitutes acceptance of any modifications.
                </p>

                <h3 className="text-[1.5rem] text-[#1a3a5c] font-semibold mb-4 mt-8">Contact Us</h3>
                <p className="leading-[1.8] mb-4">
                  For questions about these Terms and Conditions, please contact us at:
                </p>
                <p className="leading-[1.8]">
                  Email: <a href="mailto:admin@allaccessremodelers.com" className="text-[#ff6b35] hover:underline">admin@allaccessremodelers.com</a><br />
                  Phone: <a href="tel:+16146323495" className="text-[#ff6b35] hover:underline">+1 (614) 632-3495</a>
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
