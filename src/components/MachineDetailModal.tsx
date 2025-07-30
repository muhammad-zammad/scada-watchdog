import { X, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MachineData } from '@/types/scada';
import { formatDuration, getStatusColor } from '@/lib/scada-utils';

interface MachineDetailModalProps {
  machine: MachineData | null;
  open: boolean;
  onClose: () => void;
}

export function MachineDetailModal({ machine, open, onClose }: MachineDetailModalProps) {
  if (!machine) return null;

  const statusColor = getStatusColor(machine.status);

  const stats = [
    {
      label: 'Total Uptime',
      value: formatDuration(machine.total_uptime),
      icon: TrendingUp,
      color: 'text-status-running'
    },
    {
      label: 'Total Downtime',
      value: formatDuration(machine.total_downtime),
      icon: TrendingDown,
      color: 'text-status-down'
    },
    {
      label: 'Total Stop Time',
      value: formatDuration(machine.total_stop_time),
      icon: Clock,
      color: 'text-status-stopped'
    },
    {
      label: 'Average Downtime',
      value: formatDuration(machine.avg_downtime),
      icon: Activity,
      color: 'text-muted-foreground'
    }
  ];

  const totalTime = machine.total_uptime + machine.total_downtime + machine.total_stop_time;
  const uptimePercentage = totalTime > 0 ? (machine.total_uptime / totalTime) * 100 : 0;
  const downtimePercentage = totalTime > 0 ? (machine.total_downtime / totalTime) * 100 : 0;
  const stopTimePercentage = totalTime > 0 ? (machine.total_stop_time / totalTime) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-card">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              Motor {machine.motor_number} Details
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: `${statusColor}20`,
                  color: statusColor 
                }}
              >
                {machine.status}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-xl font-bold" style={{ color: statusColor }}>
                    {machine.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Update</p>
                  <p className="text-sm">
                    {new Date(machine.last_update).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="font-semibold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Downtime Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Downtime Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average Downtime</p>
                  <p className="text-2xl font-bold text-status-down">
                    {formatDuration(machine.avg_downtime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Maximum Downtime</p>
                  <p className="text-2xl font-bold text-status-down">
                    {formatDuration(machine.max_downtime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress bars */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uptime</span>
                    <span>{uptimePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-status-running"
                      style={{ width: `${uptimePercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Downtime</span>
                    <span>{downtimePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-status-down"
                      style={{ width: `${downtimePercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stop Time</span>
                    <span>{stopTimePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-status-stopped"
                      style={{ width: `${stopTimePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}