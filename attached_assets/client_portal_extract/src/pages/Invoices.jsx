import React, { useState, useEffect, useCallback } from 'react';
import { Invoice, Client, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

import InvoiceStats from '../components/invoices/InvoiceStats';
import InvoiceCard from '../components/invoices/InvoiceCard';
import InvoiceFilters from '../components/invoices/InvoiceFilters';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', client: 'all', dateRange: 'all_time' });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoiceData = useCallback(async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userFilter = { created_by: user.email };
      const [invoicesData, clientsData] = await Promise.all([
        Invoice.filter(userFilter, "-issue_date"),
        Client.filter(userFilter)
      ]);
      setInvoices(invoicesData || []);
      setClients(clientsData || []);
      setFilteredInvoices(invoicesData || []);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadInvoiceData(user);
      } catch (e) {
        console.error("Error fetching user:", e);
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadInvoiceData]);
  
  useEffect(() => {
    let filtered = [...invoices];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }
    if (filters.client !== 'all') {
      filtered = filtered.filter(inv => inv.client_id === filters.client);
    }
    
    setFilteredInvoices(filtered);
  }, [invoices, filters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-lg text-slate-700">Loading invoices...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to manage your invoices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
            <p className="text-slate-600 mt-1 font-medium">Manage your billing and get paid faster</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to={createPageUrl("InvoiceCreator")}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>

        <InvoiceStats invoices={invoices} isLoading={isLoading} />
        
        <InvoiceFilters filters={filters} onFilterChange={setFilters} clients={clients} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map(invoice => (
              <InvoiceCard key={invoice.id} invoice={invoice} client={clients.find(c => c.id === invoice.client_id)} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">No invoices found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}