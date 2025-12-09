import React, { useState, useEffect, useCallback } from "react";
import { Client } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus,
  Users,
  Star,
  DollarSign,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ClientCard from "../components/clients/ClientCard";
import ClientFilters from "../components/clients/ClientFilters";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    tier: "all",
    status: "all",
    industry: "all"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const loadClients = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const data = await Client.filter(userFilter, "-updated_date");
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...clients];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.primary_contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.tier !== "all") {
      filtered = filtered.filter(client => client.client_tier === filters.tier);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(client => client.relationship_status === filters.status);
    }
    if (filters.industry !== "all") {
      filtered = filtered.filter(client => client.industry === filters.industry);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, filters]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadClients();
    }
  }, [currentUser, loadClients]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.relationship_status === 'active').length,
    totalRevenue: clients.reduce((sum, client) => sum + (client.total_revenue || 0), 0),
    avgSatisfaction: clients.length > 0 
      ? clients.reduce((sum, client) => sum + (client.satisfaction_score || 0), 0) / clients.length 
      : 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="text-xl font-semibold text-slate-700">Loading clients...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-6">Please log in to manage your clients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Clients</h1>
            <p className="text-slate-600 mt-1 font-medium">Manage and view all your client relationships</p>
          </div>
          <Link to={createPageUrl("ClientOnboarding")}>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add New Client
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Clients</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
                <div className="text-sm text-slate-600">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-slate-600">Revenue</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.avgSatisfaction.toFixed(1)}</div>
                <div className="text-sm text-slate-600">Avg. Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search clients by name, company, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-slate-200 focus:border-slate-400"
              />
            </div>
            <ClientFilters 
              filters={filters}
              onFilterChange={setFilters}
              clients={clients}
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Showing {filteredClients.length} of {clients.length} clients
            </h2>
            {(searchQuery || Object.values(filters).some(f => f !== "all")) && (
              <Badge variant="outline" className="text-slate-600">
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No clients found</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || Object.values(filters).some(f => f !== "all")
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first client"
                }
              </p>
              <Link to={createPageUrl("ClientOnboarding")}>
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}