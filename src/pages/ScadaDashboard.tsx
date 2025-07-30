import { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MachineGrid } from '@/components/MachineGrid';
import { StatusChart } from '@/components/StatusChart';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { ExportButton } from '@/components/ExportButton';
import { MachineDetailModal } from '@/components/MachineDetailModal';
import { useScadaData } from '@/hooks/useScadaData';
import { MachineData, TimeRange } from '@/types/scada';

export default function ScadaDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>();
  const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);
  
  const { machines, loading, error, refetch } = useScadaData(selectedTimeRange);

  const handleMachineClick = (machine: MachineData) => {
    setSelectedMachine(machine);
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">SCADA Dashboard</h1>
            <p className="text-muted-foreground">Real-time machine monitoring system</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {machines.length} Machines
          </Badge>
          <ExportButton machines={machines} currentTimeRange={selectedTimeRange} />
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector 
        selectedRange={selectedTimeRange}
        onRangeChange={setSelectedTimeRange}
      />

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/20 border border-destructive rounded-lg">
          <p className="text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Machine Grid - Takes 2/3 width on xl screens */}
        <div className="xl:col-span-2">
          <MachineGrid 
            machines={machines} 
            onMachineClick={handleMachineClick}
            loading={loading}
          />
        </div>

        {/* Status Chart - Takes 1/3 width on xl screens */}
        <div className="xl:col-span-1">
          <StatusChart 
            machines={machines} 
            title={selectedTimeRange ? `Status: ${selectedTimeRange.label}` : "Overall Status"} 
          />
        </div>
      </div>

      {/* Machine Detail Modal */}
      <MachineDetailModal
        machine={selectedMachine}
        open={!!selectedMachine}
        onClose={() => setSelectedMachine(null)}
      />
    </div>
  );
}