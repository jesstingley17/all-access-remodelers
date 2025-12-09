import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PaymentModal({ invoice, client, onClose, onPaymentComplete }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    });

    const processPayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Simulate payment processing
            // In a real implementation, this would integrate with Stripe, Square, or another payment gateway
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update invoice status
            await base44.entities.CleaningInvoice.update(invoice.id, {
                status: 'paid',
                paid_at: new Date().toISOString(),
                payment_method: paymentMethod
            });

            // Send payment confirmation email
            await base44.integrations.Core.SendEmail({
                to: client.email,
                subject: `Payment Confirmation - Invoice #${invoice.id}`,
                body: `Dear ${client.name},

Thank you for your payment!

Payment Details:
- Amount Paid: $${invoice.amount_due.toFixed(2)}
- Payment Method: ${paymentMethod === 'card' ? 'Credit/Debit Card' : 'Other'}
- Payment Date: ${new Date().toLocaleString()}
- Invoice ID: ${invoice.id}

Your payment has been successfully processed. A receipt has been generated for your records.

Thank you for choosing our cleaning services!

Best regards,
Your Cleaning Team`
            });

            setPaymentComplete(true);
            setTimeout(() => {
                onPaymentComplete();
            }, 2000);
        } catch (error) {
            console.error('Error processing payment:', error);
        }
        setIsProcessing(false);
    };

    if (paymentComplete) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                        <p className="text-slate-600">
                            Your payment of ${invoice.amount_due.toFixed(2)} has been processed successfully.
                        </p>
                        <p className="text-sm text-slate-500 mt-4">
                            A confirmation email has been sent to {client.email}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Payment</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <Alert className="mb-6">
                        <AlertDescription>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Amount Due:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    ${invoice.amount_due.toFixed(2)}
                                </span>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Copy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-purple-900 mb-2">Send Payment Link to Client</p>
                                <p className="text-sm text-purple-700 mb-3">
                                    Share this secure payment link with your client so they can pay online:
                                </p>
                                <div className="flex gap-2">
                                    <Input 
                                        readOnly 
                                        value={`${window.location.origin}${createPageUrl('ClientPayment')}?invoice_id=${invoice.id}`}
                                        className="text-sm font-mono bg-white"
                                    />
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}${createPageUrl('ClientPayment')}?invoice_id=${invoice.id}`);
                                        }}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <span className="text-sm text-slate-500">OR record manual payment below</span>
                    </div>

                    <form onSubmit={processPayment} className="space-y-4">
                        <div>
                            <Label>Payment Method</Label>
                            <select 
                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="card">Credit/Debit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="check">Check</option>
                            </select>
                        </div>

                        {paymentMethod === 'card' && (
                            <>
                                <div>
                                    <Label>Card Number</Label>
                                    <Input
                                        type="text"
                                        placeholder="4242 4242 4242 4242"
                                        value={cardDetails.cardNumber}
                                        onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                                        required
                                        maxLength="19"
                                    />
                                </div>

                                <div>
                                    <Label>Cardholder Name</Label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={cardDetails.cardName}
                                        onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Expiry Date</Label>
                                        <Input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiry}
                                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                            required
                                            maxLength="5"
                                        />
                                    </div>
                                    <div>
                                        <Label>CVV</Label>
                                        <Input
                                            type="text"
                                            placeholder="123"
                                            value={cardDetails.cvv}
                                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                            required
                                            maxLength="4"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Pay ${invoice.amount_due.toFixed(2)}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}