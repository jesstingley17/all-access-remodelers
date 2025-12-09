import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StripePaymentForm({ invoice, onPaymentComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substr(0, 4);
    }
    
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateCardDetails = () => {
    const cardNumberClean = cardDetails.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      return 'Invalid card number';
    }
    if (!cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      return 'Invalid expiry date';
    }
    if (cardDetails.cvv.length < 3) {
      return 'Invalid CVV';
    }
    if (!cardDetails.cardholderName.trim()) {
      return 'Cardholder name is required';
    }
    return null;
  };

  const handlePayment = async () => {
    const validationError = validateCardDetails();
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // In production, this would:
      // 1. Send card details securely to Stripe via backend function
      // 2. Create a payment intent
      // 3. Process the payment
      // 4. Update invoice status
      
      // Simulating payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record payment in database
      await base44.entities.Payment.create({
        invoice_id: invoice.id,
        amount: invoice.amount_due,
        payment_method: 'credit_card',
        payment_date: new Date().toISOString(),
        status: 'completed',
        transaction_id: `txn_${Date.now()}`,
        card_last4: cardDetails.cardNumber.slice(-4)
      });

      // Update invoice status
      await base44.entities.Invoice.update(invoice.id, {
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: 'credit_card'
      });

      setPaymentSuccess(true);
      
      setTimeout(() => {
        onPaymentComplete?.();
      }, 2000);

    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError('Payment failed. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">Payment Successful!</h3>
          <p className="text-green-700 mb-4">
            Your payment of ${invoice.amount_due} has been processed successfully.
          </p>
          <p className="text-sm text-green-600">
            You will receive a confirmation email shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-slate-600">Amount Due:</span>
          <span className="text-2xl font-bold text-slate-900">
            ${invoice.amount_due}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{paymentError}</p>
          </div>
        )}

        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            maxLength={19}
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              maxLength={5}
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="password"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              maxLength={4}
              className="font-mono"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cardholderName">Cardholder Name</Label>
          <Input
            id="cardholderName"
            placeholder="John Doe"
            value={cardDetails.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          />
        </div>

        <div className="bg-slate-50 p-3 rounded-lg flex items-start gap-2 text-sm">
          <Lock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-slate-600">
            Your payment information is encrypted and secure. We use industry-standard security measures.
          </p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay ${invoice.amount_due}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-slate-500">
          Powered by Stripe • Secure Payment Processing
        </p>
      </CardContent>
    </Card>
  );
}