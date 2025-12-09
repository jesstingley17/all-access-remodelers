import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Receipt, Building2, Mail, Phone } from 'lucide-react';
import StripePaymentForm from '../components/payments/StripePaymentForm';

export default function ClientPayment() {
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoiceData = async () => {
      setIsLoading(true);
      try {
        // Get invoice ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoice_id');

        if (!invoiceId) {
          setError('No invoice ID provided');
          setIsLoading(false);
          return;
        }

        // Fetch invoice data
        const invoices = await base44.entities.Invoice.list();
        const foundInvoice = invoices.find(inv => inv.id === invoiceId);

        if (!foundInvoice) {
          setError('Invoice not found');
          setIsLoading(false);
          return;
        }

        if (foundInvoice.status === 'paid') {
          setError('This invoice has already been paid');
        }

        setInvoice(foundInvoice);

        // Fetch client data
        const clients = await base44.entities.ConstructionClient.list();
        const foundClient = clients.find(c => c.id === foundInvoice.client_id);
        setClient(foundClient);

      } catch (err) {
        console.error('Error loading invoice:', err);
        setError('Failed to load invoice details');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoiceData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Invoice Payment</h1>
          <p className="text-slate-600">Secure online payment portal</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Invoice #:</span>
                  <span className="font-mono font-medium">{invoice.invoice_number || invoice.id.slice(-8)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>

                {invoice.issue_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Issue Date:</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {invoice.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Due Date:</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">${invoice.total_amount}</span>
                  </div>
                </div>

                {invoice.line_items && invoice.line_items.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold text-sm mb-2">Line Items:</h4>
                    {invoice.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.description}</span>
                        <span className="font-medium">${item.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Billed To
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">{client.name}</p>
                    {client.company && (
                      <p className="text-sm text-slate-600">{client.company}</p>
                    )}
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Form */}
          <div>
            {invoice.status === 'paid' ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center">
                  <Receipt className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Already Paid</h3>
                  <p className="text-green-700">
                    This invoice has been paid on {new Date(invoice.paid_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StripePaymentForm 
                invoice={invoice}
                onPaymentComplete={() => {
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}