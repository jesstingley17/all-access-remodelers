import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <Header />

      <main className="flex-1">
        <section className="py-24 pb-20 bg-gradient-to-br from-[#111418] to-[#1C1C1C] text-white text-center" data-testid="section-privacy-hero">
          <div className="max-w-[1200px] mx-auto px-5">
            <h2 className="text-[2.75rem] text-white font-semibold tracking-[-0.5px] leading-[1.2] mb-4">
              Privacy Policy
            </h2>
            <p className="text-[1.15rem] text-white/90 max-w-[680px] mx-auto leading-[1.7]">
              Last updated: December 2024
            </p>
          </div>
        </section>

        <section className="py-24 bg-[#fafafa]" data-testid="section-privacy-content">
          <div className="max-w-[900px] mx-auto px-5">
            <Card className="bg-white p-12 rounded-xl shadow-sm border border-[#111418]/8" data-testid="card-privacy-content">
              <div className="prose prose-lg max-w-none text-[#4a4a4a]">
                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4">Introduction</h3>
                <p className="leading-[1.8] mb-6">
                  All Access Remodelers ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>

                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4 mt-8">Information We Collect</h3>
                <p className="leading-[1.8] mb-4">We may collect information about you in a variety of ways:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Personal Data: Name, email address, phone number, and mailing address</li>
                  <li>Project Information: Details about your property and service requirements</li>
                  <li>Payment Information: Billing address and payment method details</li>
                  <li>Website Usage Data: IP address, browser type, and pages visited</li>
                </ul>

                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4 mt-8">How We Use Your Information</h3>
                <p className="leading-[1.8] mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                </ul>

                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4 mt-8">Information Sharing</h3>
                <p className="leading-[1.8] mb-6">
                  We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share information with trusted third parties who assist us in operating our website, conducting our business, or serving you.
                </p>

                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4 mt-8">Data Security</h3>
                <p className="leading-[1.8] mb-6">
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4 mt-8">Your Rights</h3>
                <p className="leading-[1.8] mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Request correction of inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>

                <h3 className="text-[1.5rem] text-[#111418] font-semibold mb-4 mt-8">Contact Us</h3>
                <p className="leading-[1.8] mb-4">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="leading-[1.8]">
                  Email: <a href="mailto:admin@allaccessremodelers.com" className="text-[#C89B3C] hover:underline">admin@allaccessremodelers.com</a><br />
                  Phone: <a href="tel:+16146323495" className="text-[#C89B3C] hover:underline">+1 (614) 632-3495</a>
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
