import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Table,
  Save,
  Eye,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Report } from "@/api/entities";
import { format, subDays } from 'date-fns';

const CHART_TYPES = [
  { id: 'line', name: 'Line Chart', icon: LineChartIcon },
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'pie', name: 'Pie Chart', icon: PieChartIcon },
  { id: 'table', name: 'Data Table', icon: Table }
];

const DATA_SOURCES = [
  { id: 'projects', name: 'Projects' },
  { id: 'tasks', name: 'Tasks' },
  { id: 'time_entries', name: 'Time Entries' },
  { id: 'invoices', name: 'Invoices' },
  { id: 'clients', name: 'Clients' },
  { id: 'expenses', name: 'Expenses' }
];

const DATE_RANGES = [
  { id: 'last_week', name: 'Last Week' },
  { id: 'last_month', name: 'Last Month' },
  { id: 'last_quarter', name: 'Last Quarter' },
  { id: 'last_year', name: 'Last Year' },
  { id: 'custom', name: 'Custom Range' }
];

export default function CustomReportBuilder({ businessData, onSave }) {
  const [reportData, setReportData] = useState({
    name: '',
    description: '',
    report_type: 'custom',
    chart_types: [],
    data_sources: [],
    date_range: { type: 'last_month' },
    filters: {},
    config: {}
  });
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generatePreviewData = () => {
    // Generate sample data based on selected sources and chart types
    const sampleData = [];
    
    if (reportData.data_sources.includes('projects')) {
      const projectsByType = businessData.projects.reduce((acc, project) => {
        acc[project.project_type] = (acc[project.project_type] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(projectsByType).forEach(([type, count]) => {
        sampleData.push({ name: type.replace('_', ' '), value: count, type: 'project_count' });
      });
    }

    if (reportData.data_sources.includes('invoices') && businessData.invoices.length) {
      const revenueByMonth = businessData.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((acc, inv) => {
          const month = format(new Date(inv.issue_date), 'MMM yyyy');
          acc[month] = (acc[month] || 0) + inv.total_amount;
          return acc;
        }, {});
      
      Object.entries(revenueByMonth).forEach(([month, revenue]) => {
        sampleData.push({ name: month, value: revenue, type: 'revenue' });
      });
    }

    setPreviewData(sampleData);
  };

  const handleSave = async () => {
    if (!reportData.name || reportData.chart_types.length === 0 || reportData.data_sources.length === 0) {
      alert('Please fill in all required fields (name, chart types, and data sources).');
      return;
    }

    setIsLoading(true);
    try {
      await Report.create(reportData);
      onSave(reportData);
      alert('Report saved successfully!');
      
      // Reset form
      setReportData({
        name: '',
        description: '',
        report_type: 'custom',
        chart_types: [],
        data_sources: [],
        date_range: { type: 'last_month' },
        filters: {},
        config: {}
      });
      setPreviewData(null);
    } catch (error) {
      console.error("Error saving report:", error);
      alert('Failed to save report. Please try again.');
    }
    setIsLoading(false);
  };

  const renderPreviewChart = () => {
    if (!previewData || previewData.length === 0) return null;

    const chartType = reportData.chart_types[0]; // Use first selected chart type for preview
    
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={previewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-right p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2 text-right">{row.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return <div className="text-center text-slate-500">Select a chart type to preview</div>;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Report Builder */}
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="w-5 h-5" />
              Custom Report Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name *</Label>
                <Input
                  id="report-name"
                  value={reportData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              
              <div>
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={reportData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this report shows"
                  rows={3}
                />
              </div>
            </div>

            {/* Chart Types */}
            <div>
              <Label className="text-base font-semibold">Chart Types *</Label>
              <p className="text-sm text-slate-600 mb-3">Select how you want to visualize the data</p>
              <div className="grid grid-cols-2 gap-3">
                {CHART_TYPES.map((chart) => {
                  const IconComponent = chart.icon;
                  const isSelected = reportData.chart_types.includes(chart.id);
                  
                  return (
                    <button
                      key={chart.id}
                      onClick={() => handleArrayToggle('chart_types', chart.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{chart.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <Label className="text-base font-semibold">Data Sources *</Label>
              <p className="text-sm text-slate-600 mb-3">Choose which data to include</p>
              <div className="space-y-2">
                {DATA_SOURCES.map((source) => (
                  <div key={source.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={source.id}
                      checked={reportData.data_sources.includes(source.id)}
                      onCheckedChange={() => handleArrayToggle('data_sources', source.id)}
                    />
                    <label htmlFor={source.id} className="text-sm font-medium cursor-pointer">
                      {source.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-base font-semibold">Date Range</Label>
              <Select 
                value={reportData.date_range.type} 
                onValueChange={(value) => handleInputChange('date_range', { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Eye className="w-5 h-5" />
                Preview
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreviewData}
                disabled={reportData.chart_types.length === 0 || reportData.data_sources.length === 0}
              >
                Generate Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {previewData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {reportData.chart_types[0]?.replace('_', ' ') || 'No chart selected'}
                  </Badge>
                  <Badge variant="secondary">
                    {previewData.length} data points
                  </Badge>
                </div>
                <div className="h-64">
                  {renderPreviewChart()}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>Configure your report and click "Generate Preview"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Configuration Summary */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-slate-900">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-600">Selected Chart Types:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {reportData.chart_types.length > 0 ? (
                  reportData.chart_types.map((type) => (
                    <Badge key={type} variant="outline">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">None selected</span>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-slate-600">Data Sources:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {reportData.data_sources.length > 0 ? (
                  reportData.data_sources.map((source) => (
                    <Badge key={source} variant="outline">
                      {source.replace('_', ' ')}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">None selected</span>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-slate-600">Date Range:</Label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {DATE_RANGES.find(r => r.id === reportData.date_range.type)?.name || 'Not set'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <Button 
              onClick={handleSave}
              disabled={isLoading || !reportData.name || reportData.chart_types.length === 0 || reportData.data_sources.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving Report...' : 'Save Custom Report'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}