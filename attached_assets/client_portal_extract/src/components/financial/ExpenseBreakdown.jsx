import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

const CATEGORY_LABELS = {
  office_supplies: 'Office Supplies',
  software: 'Software',
  hardware: 'Hardware',
  travel: 'Travel',
  meals: 'Meals',
  marketing: 'Marketing',
  education: 'Education',
  insurance: 'Insurance',
  legal: 'Legal',
  accounting: 'Accounting',
  utilities: 'Utilities',
  rent: 'Rent',
  other: 'Other'
};

export default function ExpenseBreakdown({ expenses, isLoading }) {
  const processExpenseData = () => {
    if (!expenses || expenses.length === 0) return [];

    // Filter to current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = expenses.filter(expense => 
      new Date(expense.date) >= firstDayOfMonth
    );

    const categoryTotals = thisMonthExpenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: amount,
      percentage: 0 // Will be calculated by the chart
    }));
  };

  const data = processExpenseData();
  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0);

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
          <CreditCard className="w-5 h-5" />
          This Month's Expenses
        </CardTitle>
        <p className="text-sm text-slate-600">
          Total: ${totalExpenses.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No expense data for this month
          </div>
        ) : (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}