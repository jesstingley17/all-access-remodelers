import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, Clock, Edit } from 'lucide-react';
import StaffEditModal from './StaffEditModal';

export default function StaffProfileCard({ staff, onRefresh }) {
    const [showEditModal, setShowEditModal] = useState(false);

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            manager: 'bg-blue-100 text-blue-800',
            supervisor: 'bg-purple-100 text-purple-800',
            cleaner: 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-slate-100 text-slate-800';
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {staff.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">{staff.full_name}</div>
                                <Badge className={getRoleBadge(staff.staff_role)}>
                                    {staff.staff_role}
                                </Badge>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        {staff.email}
                    </div>
                    {staff.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4" />
                            {staff.phone}
                        </div>
                    )}
                    {staff.availability_hours_per_week && (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            {staff.availability_hours_per_week}h/week
                        </div>
                    )}
                    {staff.preferred_zones?.length > 0 && (
                        <div className="flex items-start gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                                {staff.preferred_zones.map((zone, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {zone}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {staff.skills?.length > 0 && (
                        <div className="pt-2 border-t">
                            <div className="text-xs text-slate-500 mb-1">Skills:</div>
                            <div className="flex flex-wrap gap-1">
                                {staff.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {!staff.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                    )}
                </CardContent>
            </Card>

            {showEditModal && (
                <StaffEditModal
                    staff={staff}
                    onClose={() => setShowEditModal(false)}
                    onRefresh={onRefresh}
                />
            )}
        </>
    );
}