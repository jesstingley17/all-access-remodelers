import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientCreateModal({ onClose, onRefresh }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'residential',
        contact_person: '',
        email: '',
        phone: '',
        billing_email: '',
        notes: '',
        status: 'active',
        org_id: 'default-org'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await base44.entities.CleaningClient.create(formData);
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error creating client:', error);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Client Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="John Doe / ABC Corporation"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Client Type *</Label>
                            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="prospect">Prospect</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Contact Person</Label>
                            <Input
                                value={formData.contact_person}
                                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                                placeholder="Primary contact name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="client@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Billing Email</Label>
                            <Input
                                type="email"
                                value={formData.billing_email}
                                onChange={(e) => setFormData({...formData, billing_email: e.target.value})}
                                placeholder="billing@example.com"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Additional notes about the client..."
                                className="h-20"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.email}>
                            {isSubmitting ? 'Creating...' : 'Create Client'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}