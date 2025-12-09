import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export default function StripeCheckoutButton({ 
  amount, 
  currency = "usd",
  clientEmail, 
  clientName,
  invoiceId,
  description,
  onSuccess,
  className = ""
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      const response = await base44.functions.invoke('createStripeCheckout', {
        amount,
        currency,
        client_email: clientEmail,
        client_name: clientName,
        invoice_id: invoiceId,
        description
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || !amount || !clientEmail}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Pay ${amount}
        </>
      )}
    </Button>
  );
}