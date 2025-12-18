import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { PillarLayout } from "@/components/Pillar";
import { RomanFrieze } from "@/components/RomanFrieze";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Calculator, Sparkles, ArrowRight, Loader2, FileText, Phone } from "lucide-react";
import { Link } from "wouter";

const serviceTypes = [
  { value: "kitchen-remodel", label: "Kitchen Remodel" },
  { value: "bathroom-renovation", label: "Bathroom Renovation" },
  { value: "flooring", label: "Flooring Installation" },
  { value: "painting", label: "Interior/Exterior Painting" },
  { value: "general-renovation", label: "General Renovation" },
  { value: "property-management", label: "Property Management" },
  { value: "deep-cleaning", label: "Deep Cleaning" },
  { value: "move-cleaning", label: "Move-In/Move-Out Cleaning" },
  { value: "maintenance", label: "General Maintenance" },
  { value: "other", label: "Other" },
];

export default function QuoteEstimator() {
  const [serviceType, setServiceType] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [location, setLocation] = useState("");
  const [estimate, setEstimate] = useState("");

  const estimateMutation = useMutation({
    mutationFn: async (data: {
      serviceType: string;
      projectDescription: string;
      squareFootage?: string;
      timeline?: string;
      location?: string;
    }) => {
      const res = await apiRequest("POST", "/api/quote-estimate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setEstimate(data.estimate);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !projectDescription) return;

    estimateMutation.mutate({
      serviceType: serviceTypes.find(s => s.value === serviceType)?.label || serviceType,
      projectDescription,
      squareFootage: squareFootage || undefined,
      timeline: timeline || undefined,
      location: location || undefined,
    });
  };

  const handleReset = () => {
    setServiceType("");
    setProjectDescription("");
    setSquareFootage("");
    setTimeline("");
    setLocation("");
    setEstimate("");
  };

  return (
    <PillarLayout className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8f7f5] via-white to-[#f8f7f5]">
      <RomanFrieze />
      <Navigation />
      
      <main className="flex-1">
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
                <Calculator className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-page-title">
                AI Quote Estimator
              </h1>
              <p className="text-muted-foreground text-lg">
                Get an instant estimate for your project powered by AI. Describe your project and receive a rough cost range along with helpful recommendations.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" />
                      Project Details
                    </CardTitle>
                    <CardDescription>
                      Tell us about your project to get an AI-powered estimate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select value={serviceType} onValueChange={setServiceType}>
                          <SelectTrigger data-testid="select-service-type">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectDescription">Project Description</Label>
                        <Textarea
                          id="projectDescription"
                          data-testid="input-project-description"
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          placeholder="Describe your project in detail... What work needs to be done? Any specific requirements or preferences?"
                          className="min-h-[120px] resize-none"
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="squareFootage">Square Footage (optional)</Label>
                          <Input
                            id="squareFootage"
                            data-testid="input-square-footage"
                            value={squareFootage}
                            onChange={(e) => setSquareFootage(e.target.value)}
                            placeholder="e.g., 200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeline">Desired Timeline (optional)</Label>
                          <Input
                            id="timeline"
                            data-testid="input-timeline"
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            placeholder="e.g., 2 weeks"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location (optional)</Label>
                        <Input
                          id="location"
                          data-testid="input-location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City or area"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={!serviceType || !projectDescription || estimateMutation.isPending}
                          data-testid="button-get-estimate"
                        >
                          {estimateMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Get AI Estimate
                            </>
                          )}
                        </Button>
                        {estimate && (
                          <Button type="button" variant="outline" onClick={handleReset} data-testid="button-reset">
                            Start Over
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {estimate ? (
                    <Card data-testid="card-estimate-result">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-accent">
                          <Sparkles className="w-5 h-5" />
                          Your Estimate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-wrap text-sm text-foreground" data-testid="text-estimate-content">
                            {estimate}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground">
                            Fill out the form to get your AI-powered estimate
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Phone className="w-10 h-10 mx-auto mb-3 text-accent" />
                        <h3 className="font-semibold text-lg mb-2">Want an Accurate Quote?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          For a detailed, accurate quote, contact us for a free on-site assessment.
                        </p>
                        <Link href="/#contact">
                          <Button variant="outline" data-testid="link-contact-us">
                            Contact Us
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <RomanFrieze />
      <Footer />
    </PillarLayout>
  );
}
