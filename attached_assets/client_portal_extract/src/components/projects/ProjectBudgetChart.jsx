import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function ProjectBudgetChart({ projects }) {
    const budgetData = projects
        .filter(p => p.budget > 0)
        .slice(0, 10)
        .map(p => ({
            name: p.title.substring(0, 20) + (p.title.length > 20 ? '...' : ''),
            budget: p.budget,
            status: p.status
        }));

    const statusColors = {
        active: '#10b981',
        planning: '#f59e0b',
        completed: '#8b5cf6',
        on_hold: '#64748b',
        cancelled: '#ef4444'
    };

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgBudget = projects.length > 0 ? totalBudget / projects.length : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <div className="flex gap-6 mt-2 text-sm text-slate-600">
                    <div>Total Budget: <span className="font-bold text-slate-900">${totalBudget.toLocaleString()}</span></div>
                    <div>Average: <span className="font-bold text-slate-900">${avgBudget.toLocaleString()}</span></div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="budget" radius={[8, 8, 0, 0]}>
                            {budgetData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}