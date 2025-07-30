import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MachineData, ExportData, TimeRange } from '@/types/scada';
import { getPredefinedTimeRanges } from '@/lib/scada-utils';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  machines: MachineData[];
  currentTimeRange?: TimeRange;
}

export function ExportButton({ machines, currentTimeRange }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const convertToExportData = (machineData: MachineData[]): ExportData[] => {
    return machineData.map(machine => ({
      machine_id: machine.motor_number,
      status: machine.status,
      uptime_hours: Math.round((machine.total_uptime / 60) * 100) / 100,
      downtime_hours: Math.round((machine.total_downtime / 60) * 100) / 100,
      stop_time_hours: Math.round((machine.total_stop_time / 60) * 100) / 100,
      avg_downtime_minutes: Math.round(machine.avg_downtime * 100) / 100,
      max_downtime_minutes: Math.round(machine.max_downtime * 100) / 100,
      last_update: machine.last_update,
    }));
  };

  const exportToExcel = async (timeRange: TimeRange | undefined, fileName: string) => {
    setIsExporting(true);
    
    try {
      // In a real implementation, you would fetch data for the specific time range
      const exportData = convertToExportData(machines);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create summary sheet
      const summaryData = [
        ['SCADA Machine Monitoring Report'],
        ['Generated:', new Date().toLocaleString()],
        ['Time Range:', timeRange ? timeRange.label : 'All Data'],
        ['Total Machines:', machines.length],
        ['Running:', machines.filter(m => m.status === 'Running').length],
        ['Stopped:', machines.filter(m => m.status === 'Stopped').length],
        ['Down:', machines.filter(m => m.status === 'Down').length],
        [], // Empty row
        ['Machine ID', 'Status', 'Uptime (hrs)', 'Downtime (hrs)', 'Stop Time (hrs)', 'Avg Downtime (min)', 'Max Downtime (min)', 'Last Update'],
        ...exportData.map(row => [
          row.machine_id,
          row.status,
          row.uptime_hours,
          row.downtime_hours,
          row.stop_time_hours,
          row.avg_downtime_minutes,
          row.max_downtime_minutes,
          row.last_update,
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Machine ID
        { wch: 10 }, // Status
        { wch: 12 }, // Uptime
        { wch: 14 }, // Downtime
        { wch: 14 }, // Stop Time
        { wch: 16 }, // Avg Downtime
        { wch: 16 }, // Max Downtime
        { wch: 20 }, // Last Update
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Machine Summary');
      
      // Create totals sheet
      const totalUptime = machines.reduce((sum, m) => sum + m.total_uptime, 0);
      const totalDowntime = machines.reduce((sum, m) => sum + m.total_downtime, 0);
      const totalStopTime = machines.reduce((sum, m) => sum + m.total_stop_time, 0);
      
      const totalsData = [
        ['SCADA System Totals'],
        [],
        ['Metric', 'Value (hours)', 'Percentage'],
        ['Total Uptime', Math.round((totalUptime / 60) * 100) / 100, `${((totalUptime / (totalUptime + totalDowntime + totalStopTime)) * 100).toFixed(1)}%`],
        ['Total Downtime', Math.round((totalDowntime / 60) * 100) / 100, `${((totalDowntime / (totalUptime + totalDowntime + totalStopTime)) * 100).toFixed(1)}%`],
        ['Total Stop Time', Math.round((totalStopTime / 60) * 100) / 100, `${((totalStopTime / (totalUptime + totalDowntime + totalStopTime)) * 100).toFixed(1)}%`],
      ];
      
      const totalsWs = XLSX.utils.aoa_to_sheet(totalsData);
      XLSX.utils.book_append_sheet(wb, totalsWs, 'Totals');
      
      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: 'Export Successful',
        description: `Data exported to ${fileName}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to Excel',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const predefinedRanges = getPredefinedTimeRanges();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting || machines.length === 0}
          className="bg-gradient-card"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => exportToExcel(currentTimeRange, 'scada-current-view.xlsx')}
        >
          Current View
          {currentTimeRange && (
            <span className="ml-auto text-xs text-muted-foreground">
              {currentTimeRange.label}
            </span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {predefinedRanges.map((range) => (
          <DropdownMenuItem
            key={range.label}
            onClick={() => exportToExcel(range, `scada-${range.label.toLowerCase().replace(/ /g, '-')}.xlsx`)}
          >
            {range.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => exportToExcel(undefined, 'scada-all-data.xlsx')}
        >
          All Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}