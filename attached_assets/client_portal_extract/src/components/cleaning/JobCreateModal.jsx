import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JobCreateModal({ onClose, onRefresh }) {
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        client_id: '',
        client_location_id: '',
        service_type_id: '',
        notes_for_team: '',
        notes_for_client: '',
        status: 'scheduled',
        scheduled_start_at: '',
        scheduled_end_at: '',
        price_quote: '',
        org_id: 'default-org'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientsData, servicesData] = await Promise.all([
                    base44.entities.CleaningClient.list(),
                    base44.entities.ServiceType.list()
                ]);
                setClients(clientsData || []);
                setServices(servicesData || []);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await base44.entities.CleaningJob.create({
                ...formData,
                price_quote: formData.price_quote ? parseFloat(formData.price_quote) : null
            });
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error creating job:', error);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Job</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Client *</Label>
                            <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Service Type *</Label>
                            <Select value={formData.service_type_id} onValueChange={(value) => setFormData({...formData, service_type_id: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(service => (
                                        <SelectItem key={service.id} value={service.id}>
                                            {service.name} - ${service.default_price}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Start Date & Time *</Label>
                            <Input
                                type="datetime-local"
                                value={formData.scheduled_start_at}
                                onChange={(e) => setFormData({...formData, scheduled_start_at: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>End Date & Time</Label>
                            <Input
                                type="datetime-local"
                                value={formData.scheduled_end_at}
                                onChange={(e) => setFormData({...formData, scheduled_end_at: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Quote Price</Label>
                            <Input
                                type="number"
                                value={formData.price_quote}
                                onChange={(e) => setFormData({...formData, price_quote: e.target.value})}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Notes for Team</Label>
                            <Textarea
                                value={formData.notes_for_team}
                                onChange={(e) => setFormData({...formData, notes_for_team: e.target.value})}
                                placeholder="Internal notes..."
                                className="h-20"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Notes for Client</Label>
                            <Textarea
                                value={formData.notes_for_client}
                                onChange={(e) => setFormData({...formData, notes_for_client: e.target.value})}
                                placeholder="Client-visible notes..."
                                className="h-20"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !formData.client_id || !formData.service_type_id || !formData.scheduled_start_at}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Job'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}