import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Building2 } from "lucide-react";
import ClientCreateModal from "../components/cleaning/ClientCreateModal";

export default function CleaningClients() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadClients = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const clientsData = await base44.entities.CleaningClient.filter(userFilter, "-updated_date");
      setClients(clientsData || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
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

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type) => {
    return type === 'commercial' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-800',
      inactive: 'bg-slate-100 text-slate-800',
      prospect: 'bg-amber-100 text-amber-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
            <p className="text-slate-600 mt-1">Manage residential and commercial clients</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      client.type === 'commercial' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {client.type === 'commercial' ? (
                        <Building2 className={`w-5 h-5 ${
                          client.type === 'commercial' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      ) : (
                        <User className={`w-5 h-5 ${
                          client.type === 'commercial' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <Badge className={getTypeColor(client.type)}>
                        {client.type}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-slate-900 text-lg mb-2">{client.name}</h3>
                
                <div className="space-y-1 text-sm text-slate-600">
                  <div>{client.contact_person}</div>
                  <div>{client.email}</div>
                  {client.phone && <div>{client.phone}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No clients found</h3>
              <p className="text-slate-500 mb-6">Add your first client to get started</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </CardContent>
          </Card>
        )}

        {showCreateModal && (
          <ClientCreateModal
            onClose={() => setShowCreateModal(false)}
            onRefresh={loadClients}
          />
        )}
      </div>
    </div>
  );
}