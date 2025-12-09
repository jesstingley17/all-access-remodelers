import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function StaffSelector({ staff, selectedStaff, onSelect }) {
  const toggleStaff = (email) => {
    if (selectedStaff.includes(email)) {
      onSelect(selectedStaff.filter(e => e !== email));
    } else {
      onSelect([...selectedStaff, email]);
    }
  };

  return (
    <div className="space-y-4">
      {staff.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No staff members available</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            Select one or more staff members to assign to this job
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staff.map((member) => (
              <Card
                key={member.email}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStaff.includes(member.email)
                    ? 'ring-2 ring-blue-600 bg-blue-50'
                    : 'hover:border-blue-300'
                }`}
                onClick={() => toggleStaff(member.email)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedStaff.includes(member.email)}
                      onCheckedChange={() => toggleStaff(member.email)}
                    />
                    <Avatar>
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{member.full_name?.[0] || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{member.full_name}</h4>
                      <p className="text-sm text-slate-600">{member.email}</p>
                      {member.staff_role && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {member.staff_role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}