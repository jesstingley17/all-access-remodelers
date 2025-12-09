import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function CashFlowForecast({ invoices, expenses, isLoading }) {
  const generateForecastData = () => {
    if (!invoices || !expenses) return [];

    const now = new Date();
    const months = [];
    
    // Generate next 6 months
    for (let i = 0; i < 6; i++) {
      const month = addMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Expected income from pending invoices
      const expectedIncome = invoices
        .filter(invoice => 
          invoice.status !== 'paid' && 
          invoice.status !== 'cancelled' &&
          new Date(invoice.due_date) >= monthStart &&
          new Date(invoice.due_date) <= monthEnd
        )
        .reduce((sum, invoice) => sum + (invoice.remaining_amount || invoice.total_amount || 0), 0);
      
      // Projected expenses (average from last 3 months)
      const historicalExpenses = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          const threeMonthsAgo = addMonths(now, -3);
          return expenseDate >= threeMonthsAgo && expenseDate < now;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const avgMonthlyExpenses = historicalExpenses / 3;
      
      months.push({
        month: format(month, 'MMM yyyy'),
        income: expectedIncome,
        expenses: i === 0 ? avgMonthlyExpenses : avgMonthlyExpenses, // Use average for projections
        netCashFlow: expectedIncome - avgMonthlyExpenses
      });
    }
    
    return months;
  };

  const data = generateForecastData();

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Calendar className="w-5 h-5" />
          Cash Flow Forecast
        </CardTitle>
        <p className="text-sm text-slate-600">
          Projected income and expenses for the next 6 months
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${Math.abs(value).toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                name="Expected Income"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                name="Projected Expenses"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}