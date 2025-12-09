import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MoreVertical
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  draft: "bg-slate-100 text-slate-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800"
};

const statusIcons = {
  draft: FileText,
  sent: Eye,
  viewed: Clock,
  paid: CheckCircle,
  overdue: AlertTriangle,
  cancelled: FileText
};

export default function InvoiceCard({ invoice, clients, projects }) {
  const client = clients.find(c => c.id === invoice.client_id);
  const project = projects.find(p => p.id === invoice.project_id);
  const StatusIcon = statusIcons[invoice.status];
  
  const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date();
  const daysUntilDue = differenceInDays(new Date(invoice.due_date), new Date());
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <StatusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">#{invoice.invoice_number}</h3>
              <p className="text-sm text-slate-600">{client?.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[isOverdue ? 'overdue' : invoice.status]}>
              {isOverdue ? 'Overdue' : invoice.status.replace('_', ' ')}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-600" />
            <span className="text-2xl font-bold text-slate-900">
              ${invoice.total_amount?.toLocaleString()}
            </span>
          </div>
          {invoice.currency !== 'USD' && (
            <Badge variant="outline">{invoice.currency}</Badge>
          )}
        </div>

        {project && (
          <div className="text-sm text-slate-600">
            Project: {project.title}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Due {format(new Date(invoice.due_date), 'MMM d')}</span>
          </div>
          {daysUntilDue < 0 ? (
            <span className="text-red-600 font-medium">
              {Math.abs(daysUntilDue)} days overdue
            </span>
          ) : daysUntilDue <= 7 ? (
            <span className="text-amber-600 font-medium">
              Due in {daysUntilDue} days
            </span>
          ) : (
            <span className="text-slate-600">
              Due in {daysUntilDue} days
            </span>
          )}
        </div>

        {invoice.paid_amount > 0 && invoice.remaining_amount > 0 && (
          <div className="text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Paid: ${invoice.paid_amount.toLocaleString()}</span>
              <span>Remaining: ${invoice.remaining_amount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{ width: `${(invoice.paid_amount / invoice.total_amount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-200">
          <Link to={createPageUrl(`InvoiceDetail/${invoice.id}`)} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {invoice.status === 'draft' && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Send
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}