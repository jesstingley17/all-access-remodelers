import React, { useState, useEffect, useCallback } from 'react';
import { Invoice, Expense, TimeEntry, Project, User } from '@/api/entities';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

import QuickStats from '../components/financial/QuickStats';
import RevenueChart from '../components/financial/RevenueChart';
import ExpenseBreakdown from '../components/financial/ExpenseBreakdown';
import CashFlowForecast from '../components/financial/CashFlowForecast';
import FinancialGoalProgress from '../components/financial/FinancialGoalProgress';

export default function FinancialDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [goals, setGoals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFinancialData = useCallback(async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userFilter = { created_by: user.email };
      const [invoicesData, expensesData, timeData, projectsData, goalsData] = await Promise.all([
        Invoice.filter(userFilter),
        Expense.filter(userFilter),
        TimeEntry.filter(userFilter),
        Project.filter(userFilter),
        base44.entities.FinancialGoal.filter(userFilter)
      ]);
      setInvoices(invoicesData || []);
      setExpenses(expensesData || []);
      setTimeEntries(timeData || []);
      setProjects(projectsData || []);
      setGoals(goalsData || []);
    } catch (error) {
      console.error("Error loading financial data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadFinancialData(user);
      } catch (e) {
        console.error("Error fetching user:", e);
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadFinancialData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-lg text-slate-700">Loading financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to view your financial dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Dashboard</h1>
            <p className="text-slate-600 mt-1 font-medium">Your business financial health at a glance</p>
          </div>
        </div>

        <QuickStats 
          invoices={invoices} 
          expenses={expenses} 
          timeEntries={timeEntries} 
          isLoading={isLoading} 
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart invoices={invoices} expenses={expenses} isLoading={isLoading} />
          </div>
          <div>
            <ExpenseBreakdown expenses={expenses} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <CashFlowForecast invoices={invoices} expenses={expenses} isLoading={isLoading} />
          <FinancialGoalProgress goals={goals} projects={projects} invoices={invoices} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}