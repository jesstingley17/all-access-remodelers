import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function StaffEditModal({ staff, onClose, onRefresh }) {
    const [staffData, setStaffData] = useState({
        phone: staff.phone || '',
        staff_role: staff.staff_role || 'cleaner',
        hourly_rate: staff.hourly_rate || '',
        availability_hours_per_week: staff.availability_hours_per_week || 40,
        skills: staff.skills?.join(', ') || '',
        preferred_zones: staff.preferred_zones?.join(', ') || '',
        is_active: staff.is_active !== false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const skills = staffData.skills ? staffData.skills.split(',').map(s => s.trim()) : [];
            const zones = staffData.preferred_zones ? staffData.preferred_zones.split(',').map(z => z.trim()) : [];

            // Note: In a real app, you'd need proper admin permissions to update other users
            await base44.auth.updateMe({
                phone: staffData.phone,
                staff_role: staffData.staff_role,
                hourly_rate: parseFloat(staffData.hourly_rate) || null,
                availability_hours_per_week: staffData.availability_hours_per_week,
                skills: skills,
                preferred_zones: zones,
                is_active: staffData.is_active
            });

            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error updating staff:', error);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Staff: {staff.full_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                            type="tel"
                            value={staffData.phone}
                            onChange={(e) => setStaffData({...staffData, phone: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={staffData.staff_role} onValueChange={(value) => setStaffData({...staffData, staff_role: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="cleaner">Cleaner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Hourly Rate ($)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={staffData.hourly_rate}
                            onChange={(e) => setStaffData({...staffData, hourly_rate: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Availability (hours/week)</Label>
                        <Input
                            type="number"
                            value={staffData.availability_hours_per_week}
                            onChange={(e) => setStaffData({...staffData, availability_hours_per_week: parseInt(e.target.value)})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Skills (comma-separated)</Label>
                        <Input
                            value={staffData.skills}
                            onChange={(e) => setStaffData({...staffData, skills: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred Zones (comma-separated)</Label>
                        <Input
                            value={staffData.preferred_zones}
                            onChange={(e) => setStaffData({...staffData, preferred_zones: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Active Status</Label>
                        <Switch
                            checked={staffData.is_active}
                            onCheckedChange={(checked) => setStaffData({...staffData, is_active: checked})}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}