import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ProjectProfitability({ projects, timeEntries, isLoading }) {
  const [hourlyRate, setHourlyRate] = useState(75);

  const calculateProfitability = () => {
    return projects.map(project => {
      const projectEntries = timeEntries.filter(entry => entry.project_id === project.id);
      const actualHours = projectEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;
      const cost = actualHours * hourlyRate;
      const profit = project.budget ? project.budget - cost : null;
      const effectiveRate = actualHours > 0 ? project.budget / actualHours : 0;
      
      return {
        ...project,
        actualHours,
        cost,
        profit,
        effectiveRate
      };
    });
  };

  const data = calculateProfitability();

  const getProfitabilityBadge = (profit) => {
    if (profit === null) return <Badge variant="outline">N/A</Badge>;
    if (profit > 0) return <Badge className="bg-emerald-100 text-emerald-800">Profitable</Badge>;
    if (profit < 0) return <Badge className="bg-red-100 text-red-800">Unprofitable</Badge>;
    return <Badge>Breakeven</Badge>;
  };
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <Label>Your Hourly Rate ($)</Label>
        <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Est. Hours</TableHead>
            <TableHead>Actual Hours</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Effective Rate</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(p => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell>${p.budget?.toLocaleString() || 'N/A'}</TableCell>
              <TableCell>{p.estimated_hours || 'N/A'}h</TableCell>
              <TableCell>{p.actualHours.toFixed(1)}h</TableCell>
              <TableCell>${p.cost.toFixed(0)}</TableCell>
              <TableCell className={p.profit > 0 ? 'text-emerald-600' : 'text-red-600'}>
                ${p.profit?.toFixed(0) || 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  ${p.effectiveRate?.toFixed(0) || 'N/A'}
                  {p.effectiveRate > hourlyRate && <ArrowUp className="w-4 h-4 text-emerald-500" />}
                  {p.effectiveRate < hourlyRate && p.effectiveRate > 0 && <ArrowDown className="w-4 h-4 text-red-500" />}
                </div>
              </TableCell>
              <TableCell>{getProfitabilityBadge(p.profit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}