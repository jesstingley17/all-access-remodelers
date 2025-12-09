import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Loader2, FileText, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIInvoiceGenerator({ job, client, location, service, onInvoiceCreated }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    const generateInvoice = async () => {
        setIsGenerating(true);
        try {
            const prompt = `You are a professional invoicing assistant for a cleaning business. Generate a detailed invoice for a completed cleaning job.

Job Details:
- Job ID: ${job.id}
- Service Type: ${service?.name || 'Standard Cleaning'}
- Scheduled Time: ${new Date(job.scheduled_start_at).toLocaleString()}
- Completed Time: ${job.completed_at ? new Date(job.completed_at).toLocaleString() : 'N/A'}
- Duration: ${job.estimated_duration_minutes || service?.default_duration_minutes || 120} minutes
- Base Price Quote: $${job.price_quote || service?.default_price || 0}

Client Information:
- Name: ${client?.name}
- Type: ${client?.type}
- Location: ${location?.label || 'N/A'}
- Address: ${location?.address_line1}, ${location?.city}

Service Details:
- Base Service: ${service?.name}
- Description: ${service?.description || 'Professional cleaning service'}

Additional Information:
- Job Notes: ${job.notes_for_team || 'None'}
- Service Add-ons: ${job.service_addons?.length > 0 ? job.service_addons.join(', ') : 'None'}

Generate a professional invoice with:
1. Itemized breakdown of services
2. Calculate appropriate discounts if applicable (first-time client, repeat customer, etc)
3. Calculate taxes (assume 8% sales tax)
4. Professional line item descriptions
5. Payment terms and due date
6. Any applicable fees or adjustments`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        invoice_number: { type: "string" },
                        line_items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    description: { type: "string" },
                                    quantity: { type: "number" },
                                    unit_price: { type: "number" },
                                    total: { type: "number" }
                                }
                            }
                        },
                        subtotal: { type: "number" },
                        discount_amount: { type: "number" },
                        discount_reason: { type: "string" },
                        tax_rate: { type: "number" },
                        tax_amount: { type: "number" },
                        total_amount: { type: "number" },
                        payment_terms: { type: "string" },
                        due_date: { type: "string" },
                        notes: { type: "string" }
                    }
                }
            });

            setInvoiceData(response);
        } catch (error) {
            console.error('Error generating invoice:', error);
        }
        setIsGenerating(false);
    };

    const createInvoice = async () => {
        if (!invoiceData) return;

        try {
            const invoice = await base44.entities.CleaningInvoice.create({
                org_id: job.org_id,
                job_id: job.id,
                client_id: job.client_id,
                amount_due: invoiceData.total_amount,
                currency: 'USD',
                due_date: invoiceData.due_date,
                status: 'sent',
                issued_at: new Date().toISOString()
            });

            // Send invoice email to client
            await base44.integrations.Core.SendEmail({
                to: client.email,
                subject: `Invoice ${invoiceData.invoice_number} - ${service?.name || 'Cleaning Service'}`,
                body: `Dear ${client.name},

Thank you for choosing our cleaning services!

Invoice Number: ${invoiceData.invoice_number}
Date: ${new Date().toLocaleDateString()}

Services Provided:
${invoiceData.line_items.map(item => 
    `- ${item.description}: $${item.total.toFixed(2)}`
).join('\n')}

Subtotal: $${invoiceData.subtotal.toFixed(2)}
${invoiceData.discount_amount > 0 ? `Discount (${invoiceData.discount_reason}): -$${invoiceData.discount_amount.toFixed(2)}\n` : ''}Tax (${(invoiceData.tax_rate * 100).toFixed(0)}%): $${invoiceData.tax_amount.toFixed(2)}

Total Amount Due: $${invoiceData.total_amount.toFixed(2)}

Payment Terms: ${invoiceData.payment_terms}
Due Date: ${new Date(invoiceData.due_date).toLocaleDateString()}

${invoiceData.notes}

Please click the link below to pay online:
[Payment Portal Link]

Thank you for your business!

Best regards,
Your Cleaning Team`
            });

            onInvoiceCreated(invoice);
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-green-600" />
                    AI Invoice Generator
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!invoiceData ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Generate a professional invoice with AI-calculated pricing and discounts
                        </p>
                        <Button onClick={generateInvoice} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Invoice
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription>
                                <strong>Invoice #{invoiceData.invoice_number}</strong> generated successfully
                            </AlertDescription>
                        </Alert>

                        <div className="bg-white border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b">
                                <div>
                                    <div className="text-xs text-slate-600">Invoice Date</div>
                                    <div className="font-medium">{new Date().toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-600">Due Date</div>
                                    <div className="font-medium">{new Date(invoiceData.due_date).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-slate-700 mb-2">Line Items</div>
                                <div className="space-y-2">
                                    {invoiceData.line_items.map((item, idx) => (
                                        <div key={idx} className="flex items-start justify-between text-sm bg-slate-50 p-2 rounded">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.description}</div>
                                                <div className="text-xs text-slate-600">
                                                    {item.quantity} × ${item.unit_price.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="font-medium">${item.total.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-3 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium">${invoiceData.subtotal.toFixed(2)}</span>
                                </div>
                                
                                {invoiceData.discount_amount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-green-600">Discount</span>
                                            <span className="text-xs text-slate-500 ml-2">({invoiceData.discount_reason})</span>
                                        </div>
                                        <span className="font-medium text-green-600">-${invoiceData.discount_amount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Tax ({(invoiceData.tax_rate * 100).toFixed(0)}%)</span>
                                    <span className="font-medium">${invoiceData.tax_amount.toFixed(2)}</span>
                                </div>

                                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-green-600">${invoiceData.total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded text-sm">
                                <div className="font-medium text-blue-900 mb-1">Payment Terms</div>
                                <div className="text-blue-800">{invoiceData.payment_terms}</div>
                            </div>

                            {invoiceData.notes && (
                                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                    {invoiceData.notes}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => setInvoiceData(null)} variant="outline" className="flex-1">
                                Regenerate
                            </Button>
                            <Button onClick={createInvoice} className="flex-1 bg-green-600 hover:bg-green-700">
                                <Send className="w-4 h-4 mr-2" />
                                Create & Send Invoice
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}