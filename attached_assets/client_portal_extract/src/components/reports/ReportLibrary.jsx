import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Mail,
  Trash2,
  Star,
  StarOff,
  Search,
  Filter,
  ExternalLink,
  Settings
} from "lucide-react";
import { Report } from "@/api/entities";
import { format } from 'date-fns';
import ExportModal from './ExportModal';
import ScheduleModal from './ScheduleModal';

const reportTypeColors = {
  kpi_dashboard: 'bg-blue-100 text-blue-800',
  financial: 'bg-emerald-100 text-emerald-800',
  project_performance: 'bg-purple-100 text-purple-800',
  client_analysis: 'bg-amber-100 text-amber-800',
  productivity: 'bg-indigo-100 text-indigo-800',
  custom: 'bg-slate-100 text-slate-800'
};

export default function ReportLibrary({ reports, onReportUpdate, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = reports.filter(report => {
    const searchMatch = searchTerm === '' || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = selectedType === 'all' || report.report_type === selectedType;
    
    return searchMatch && typeMatch;
  });

  const handleToggleFavorite = async (report) => {
    try {
      await Report.update(report.id, { is_favorite: !report.is_favorite });
      onReportUpdate();
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await Report.delete(reportId);
        onReportUpdate();
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  const handleExport = (report) => {
    setSelectedReport(report);
    setShowExportModal(true);
  };

  const handleSchedule = (report) => {
    setSelectedReport(report);
    setShowScheduleModal(true);
  };

  const generateReportData = (report) => {
    // This would typically generate actual report data
    // For now, we'll return a sample structure
    return {
      title: report.name,
      generatedAt: new Date().toISOString(),
      dateRange: report.date_range,
      data: {
        summary: "Sample report data would be generated here",
        charts: report.chart_types,
        sources: report.data_sources
      }
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Report Library</h2>
          <p className="text-slate-600">Manage and access all your saved reports</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="kpi_dashboard">KPI Dashboard</option>
            <option value="financial">Financial</option>
            <option value="project_performance">Project Performance</option>
            <option value="client_analysis">Client Analysis</option>
            <option value="productivity">Productivity</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 relative group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <Badge className={reportTypeColors[report.report_type]}>
                        {report.report_type.replace('_', ' ')}
                      </Badge>
                      {report.is_favorite && (
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      )}
                    </div>
                    <CardTitle className="text-lg text-slate-900 line-clamp-2">
                      {report.name}
                    </CardTitle>
                    {report.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {report.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Report Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Charts:</span>
                    <span className="font-medium text-slate-900">
                      {report.chart_types?.join(', ') || 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Data Sources:</span>
                    <span className="font-medium text-slate-900">
                      {report.data_sources?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Date Range:</span>
                    <span className="font-medium text-slate-900">
                      {report.date_range?.type?.replace('_', ' ') || 'Not set'}
                    </span>
                  </div>
                </div>

                {/* Scheduling Info */}
                {report.schedule?.enabled && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span>Scheduled {report.schedule.frequency}</span>
                    </div>
                    {report.schedule.next_send && (
                      <p className="text-xs text-blue-600 mt-1">
                        Next: {format(new Date(report.schedule.next_send), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFavorite(report)}
                    className="flex-1"
                  >
                    {report.is_favorite ? (
                      <StarOff className="w-4 h-4 mr-1" />
                    ) : (
                      <Star className="w-4 h-4 mr-1" />
                    )}
                    {report.is_favorite ? 'Unfavorite' : 'Favorite'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(report)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSchedule(report)}
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm || selectedType !== 'all' ? 'No reports found' : 'No saved reports'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first custom report to get started'
              }
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Report
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Modal */}
      {showExportModal && selectedReport && (
        <ExportModal
          report={selectedReport}
          reportData={generateReportData(selectedReport)}
          onClose={() => {
            setShowExportModal(false);
            setSelectedReport(null);
          }}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedReport && (
        <ScheduleModal
          report={selectedReport}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedReport(null);
          }}
          onSave={(scheduleData) => {
            onReportUpdate();
            setShowScheduleModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}