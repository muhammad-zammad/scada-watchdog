import { MachineData } from '@/types/scada';
import { MachineIcon } from './MachineIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MachineGridProps {
  machines: MachineData[];
  onMachineClick?: (machine: MachineData) => void;
  loading?: boolean;
}

export function MachineGrid({ machines, onMachineClick, loading }: MachineGridProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Machine Status Overview
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const runningCount = machines.filter(m => m.status === 'Running').length;
  const stoppedCount = machines.filter(m => m.status === 'Stopped').length;
  const downCount = machines.filter(m => m.status === 'Down').length;

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Machine Status Overview</span>
          <div className="flex gap-2">
            <Badge className="bg-status-running text-white">
              {runningCount} Running
            </Badge>
            <Badge className="bg-status-stopped text-black">
              {stoppedCount} Stopped
            </Badge>
            <Badge className="bg-status-down text-white">
              {downCount} Down
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {machines.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No machine data available</p>
            <p className="text-sm mt-2">Check your Supabase connection and table data</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {machines.map((machine) => (
              <MachineIcon
                key={machine.motor_number}
                machine={machine}
                onClick={onMachineClick}
                className="aspect-square"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}