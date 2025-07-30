import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MachineData, ChartData } from '@/types/scada';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/scada-utils';

interface StatusChartProps {
  machines: MachineData[];
  title?: string;
}

export function StatusChart({ machines, title = "Overall Status Distribution" }: StatusChartProps) {
  // Calculate totals across all machines
  const totalUptime = machines.reduce((sum, m) => sum + m.total_uptime, 0);
  const totalDowntime = machines.reduce((sum, m) => sum + m.total_downtime, 0);
  const totalStopTime = machines.reduce((sum, m) => sum + m.total_stop_time, 0);

  const chartData: ChartData[] = [
    {
      name: 'Uptime',
      value: totalUptime,
      fill: 'hsl(var(--status-running))'
    },
    {
      name: 'Downtime',
      value: totalDowntime,
      fill: 'hsl(var(--status-down))'
    },
    {
      name: 'Stop Time',
      value: totalStopTime,
      fill: 'hsl(var(--status-stopped))'
    }
  ].filter(item => item.value > 0); // Only show categories with values

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatDuration(data.value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value / (totalUptime + totalDowntime + totalStopTime)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-foreground">
              {entry.value}: {formatDuration(chartData.find(d => d.name === entry.value)?.value || 0)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--border))"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-status-running">
              {formatDuration(totalUptime)}
            </div>
            <div className="text-xs text-muted-foreground">Total Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-status-down">
              {formatDuration(totalDowntime)}
            </div>
            <div className="text-xs text-muted-foreground">Total Downtime</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-status-stopped">
              {formatDuration(totalStopTime)}
            </div>
            <div className="text-xs text-muted-foreground">Total Stop Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}