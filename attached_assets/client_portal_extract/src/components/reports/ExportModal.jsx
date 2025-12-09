import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  Table, 
  Image,
  Mail,
  X
} from "lucide-react";

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF Document', icon: FileText, description: 'Professional report with charts and formatting' },
  { id: 'excel', name: 'Excel Spreadsheet', icon: Table, description: 'Data tables with calculations' },
  { id: 'csv', name: 'CSV Data', icon: Table, description: 'Raw data for further analysis' },
  { id: 'png', name: 'PNG Images', icon: Image, description: 'Chart images for presentations' }
];

export default function ExportModal({ report, reportData, onClose }) {
  const [selectedFormats, setSelectedFormats] = useState(['pdf']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(true);
  const [emailDelivery, setEmailDelivery] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleFormatToggle = (formatId) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Generate the report in selected formats
      // 2. Either download files or email them
      // 3. Use proper export libraries (jsPDF, xlsx, etc.)
      
      if (emailDelivery && emailAddress) {
        alert(`Report exported and sent to ${emailAddress}`);
      } else {
        // Simulate file download
        const fileName = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        selectedFormats.forEach(format => {
          const link = document.createElement('a');
          link.href = '#'; // Would be actual file URL
          link.download = `${fileName}.${format}`;
          // link.click(); // Uncomment for actual download
        });
        alert(`Report exported in ${selectedFormats.join(', ').toUpperCase()} format(s)`);
      }
      
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report: {report.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Export Formats */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Export Formats</Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((format) => {
                const IconComponent = format.icon;
                const isSelected = selectedFormats.includes(format.id);
                
                return (
                  <button
                    key={format.id}
                    onClick={() => handleFormatToggle(format.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{format.name}</span>
                    </div>
                    <p className="text-sm text-slate-600">{format.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <label htmlFor="include-charts" className="text-sm font-medium cursor-pointer">
                  Include charts and visualizations
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-raw-data"
                  checked={includeRawData}
                  onCheckedChange={setIncludeRawData}
                />
                <label htmlFor="include-raw-data" className="text-sm font-medium cursor-pointer">
                  Include raw data tables
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-delivery"
                  checked={emailDelivery}
                  onCheckedChange={setEmailDelivery}
                />
                <label htmlFor="email-delivery" className="text-sm font-medium cursor-pointer">
                  Email report instead of download
                </label>
              </div>
              
              {emailDelivery && (
                <div className="ml-6">
                  <Label htmlFor="email-address" className="text-sm">Email Address</Label>
                  <input
                    id="email-address"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Report Preview */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Report Summary</Label>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Date Range:</span>
                  <span className="ml-2 font-medium">{report.date_range?.type?.replace('_', ' ') || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-600">Data Sources:</span>
                  <span className="ml-2 font-medium">{report.data_sources?.length || 0}</span>
                </div>
                <div>
                  <span className="text-slate-600">Chart Types:</span>
                  <span className="ml-2 font-medium">{report.chart_types?.length || 0}</span>
                </div>
                <div>
                  <span className="text-slate-600">Generated:</span>
                  <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={selectedFormats.length === 0 || isExporting || (emailDelivery && !emailAddress)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}