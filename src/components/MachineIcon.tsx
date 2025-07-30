import { useState } from 'react';
import { Settings, Activity, AlertTriangle, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MachineData } from '@/types/scada';
import { formatDuration } from '@/lib/scada-utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MachineIconProps {
  machine: MachineData;
  onClick?: (machine: MachineData) => void;
  className?: string;
}

export function MachineIcon({ machine, onClick, className }: MachineIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusIcon = () => {
    switch (machine.status) {
      case 'Running':
        return <Activity className="h-8 w-8" />;
      case 'Stopped':
        return <Power className="h-8 w-8" />;
      case 'Down':
        return <AlertTriangle className="h-8 w-8" />;
      default:
        return <Settings className="h-8 w-8" />;
    }
  };

  const getStatusStyles = () => {
    const baseStyles = "transition-all duration-300";
    
    switch (machine.status) {
      case 'Running':
        return cn(
          baseStyles,
          "bg-status-running text-white border-status-running",
          isHovered && "animate-pulse-glow scale-105"
        );
      case 'Stopped':
        return cn(
          baseStyles,
          "bg-status-stopped text-black border-status-stopped",
          isHovered && "scale-105"
        );
      case 'Down':
        return cn(
          baseStyles,
          "bg-status-down text-white border-status-down",
          isHovered && "scale-105 shadow-lg shadow-status-down/50"
        );
      default:
        return cn(baseStyles, "bg-muted text-muted-foreground border-muted");
    }
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer overflow-hidden bg-gradient-card border-2",
        "hover:shadow-lg transition-all duration-300",
        getStatusStyles(),
        className
      )}
      onClick={() => onClick?.(machine)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 flex flex-col items-center space-y-3">
        {/* Machine Icon */}
        <div className="relative">
          {getStatusIcon()}
          {machine.status === 'Running' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-status-running rounded-full animate-ping" />
          )}
        </div>

        {/* Machine Number */}
        <div className="text-center">
          <h3 className="font-bold text-lg">Motor {machine.motor_number}</h3>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-medium mt-1",
              machine.status === 'Running' && "bg-status-running/20 text-status-running",
              machine.status === 'Stopped' && "bg-status-stopped/20 text-status-stopped",
              machine.status === 'Down' && "bg-status-down/20 text-status-down"
            )}
          >
            {machine.status}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="w-full text-center space-y-1 text-xs opacity-90">
          {machine.status === 'Down' && (
            <div>Down: {formatDuration(machine.total_downtime)}</div>
          )}
          {machine.status === 'Stopped' && (
            <div>Stopped: {formatDuration(machine.total_stop_time)}</div>
          )}
          {machine.status === 'Running' && (
            <div>Uptime: {formatDuration(machine.total_uptime)}</div>
          )}
        </div>

        {/* Last Update Indicator */}
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-current rounded-full opacity-60" />
        </div>
      </div>
    </Card>
  );
}