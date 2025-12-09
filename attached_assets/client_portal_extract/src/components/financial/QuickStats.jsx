import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  PieChart,
  Target,
  CreditCard
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function QuickStats({ invoices = [], expenses = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthInvoices = invoices.filter(inv => {
    const date = new Date(inv.issued_at || inv.created_date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const lastMonthInvoices = invoices.filter(inv => {
    const date = new Date(inv.issued_at || inv.created_date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  const thisMonthExpensesData = expenses.filter(exp => {
    const date = new Date(exp.expense_date || exp.created_date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const thisMonthRevenue = thisMonthInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const lastMonthRevenue = lastMonthInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  const outstandingAmount = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const thisMonthExpensesTotal = thisMonthExpensesData.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const thisMonthProfit = thisMonthRevenue - thisMonthExpensesTotal;

  const profitMargin = thisMonthRevenue > 0 ? (thisMonthProfit / thisMonthRevenue) * 100 : 0;

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  const stats = [
    {
      title: "This Month Revenue",
      value: `$${thisMonthRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-600",
      trend: revenueGrowth > 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`,
      trendPositive: revenueGrowth >= 0
    },
    {
      title: "Outstanding",
      value: `$${outstandingAmount.toLocaleString()}`,
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "This Month Expenses",
      value: `$${thisMonthExpensesTotal.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-red-100 text-red-600"
    },
    {
      title: "Net Profit",
      value: `$${thisMonthProfit.toLocaleString()}`,
      icon: Target,
      color: thisMonthProfit >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
    },
    {
      title: "Profit Margin",
      value: `${profitMargin.toFixed(1)}%`,
      icon: PieChart,
      color: profitMargin >= 20 ? "bg-emerald-100 text-emerald-600" : 
            profitMargin >= 10 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
    },
    {
      title: "Overdue Invoices",
      value: overdueCount.toString(),
      icon: AlertTriangle,
      color: overdueCount === 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-slate-900 truncate">{stat.value}</div>
                <div className="text-xs text-slate-600">{stat.title}</div>
                {stat.trend && (
                  <div className={`text-xs font-medium ${stat.trendPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trend} vs last month
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}