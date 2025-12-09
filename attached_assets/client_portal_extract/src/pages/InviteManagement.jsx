import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, CheckCircle, Mail, Calendar, User } from "lucide-react";
import { toast } from "sonner";

export default function InviteManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_email: "",
    client_name: "",
    days_valid: 7
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        const allowedEmails = ['admin@allaccessremodelers.com', 'thrivebyjessicalee@gmail.com'];
        if (!allowedEmails.includes(user.email)) {
          toast.error('Access denied - Admin only');
          window.location.href = '/Home';
          return;
        }
        setCurrentUser(user);
        loadInvites();
      } catch (e) {
        window.location.href = '/Landing';
      }
    };
    initialize();
  }, []);

  const loadInvites = async () => {
    setIsLoading(true);
    try {
      const invitesData = await base44.entities.InviteCode.list('-created_date');
      setInvites(invitesData || []);
    } catch (error) {
      console.error("Error loading invites:", error);
    }
    setIsLoading(false);
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createInvite = async () => {
    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.days_valid);

      await base44.entities.InviteCode.create({
        code,
        client_email: formData.client_email,
        client_name: formData.client_name,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      });

      toast.success('Invite created successfully');
      setFormData({ client_email: "", client_name: "", days_valid: 7 });
      setShowForm(false);
      loadInvites();
    } catch (error) {
      console.error("Error creating invite:", error);
      toast.error('Failed to create invite');
    }
  };

  const copyInviteLink = (code) => {
    const link = `${window.location.origin}/Landing?invite=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-800',
      used: 'bg-green-100 text-green-800',
      expired: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading invites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Client Invites</h1>
            <p className="text-slate-600 mt-1">Generate and manage client signup invitations</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            New Invite
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Invite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Client Email *</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Valid for (days)</Label>
                <Input
                  type="number"
                  value={formData.days_valid}
                  onChange={(e) => setFormData({...formData, days_valid: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={createInvite}
                  disabled={!formData.client_email}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Generate Invite
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {invites.map(invite => (
            <Card key={invite.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(invite.status)}>
                        {invite.status}
                      </Badge>
                      <span className="font-mono text-lg font-bold text-slate-900">{invite.code}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {invite.client_email}
                      </div>
                      {invite.client_name && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4" />
                          {invite.client_name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        Expires: {new Date(invite.expires_at).toLocaleDateString()}
                      </div>
                    </div>

                    {invite.used_at && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Used on {new Date(invite.used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {invite.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyInviteLink(invite.code)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {invites.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No invites yet</h3>
                <p className="text-slate-500 mb-6">Create your first client invitation</p>
                <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invite
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}