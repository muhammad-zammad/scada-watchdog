import { MachineStatusRecord, MachineStatus, MachineData, TimeRange } from '@/types/scada';

export function getMachineStatus(record: MachineStatusRecord): MachineStatus {
  if (record.state === 'ON') {
    return 'Running';
  }
  
  if (record.state === 'OFF') {
    return record.down_time > 15 ? 'Down' : 'Stopped';
  }
  
  return 'Stopped';
}

export function getStatusColor(status: MachineStatus): string {
  switch (status) {
    case 'Running':
      return 'hsl(var(--status-running))';
    case 'Stopped':
      return 'hsl(var(--status-stopped))';
    case 'Down':
      return 'hsl(var(--status-down))';
    default:
      return 'hsl(var(--muted))';
  }
}

export function aggregateMachineData(
  records: MachineStatusRecord[],
  timeRange?: TimeRange
): MachineData[] {
  const filteredRecords = timeRange 
    ? records.filter(record => {
        const recordTime = new Date(record.timestamp);
        return recordTime >= timeRange.start && recordTime <= timeRange.end;
      })
    : records;

  const machineMap = new Map<number, MachineStatusRecord[]>();
  
  // Group records by machine
  filteredRecords.forEach(record => {
    if (!machineMap.has(record.motor_number)) {
      machineMap.set(record.motor_number, []);
    }
    machineMap.get(record.motor_number)!.push(record);
  });

  // Calculate aggregated data for each machine
  return Array.from(machineMap.entries()).map(([motor_number, machineRecords]) => {
    // Sort by timestamp to get latest record
    const sortedRecords = machineRecords.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const latestRecord = sortedRecords[0];
    const status = getMachineStatus(latestRecord);

    // Calculate totals (in minutes)
    const totalUptime = machineRecords
      .filter(r => r.state === 'ON')
      .reduce((sum, r) => sum + (r.stop_time || 0), 0);
      
    const totalDowntime = machineRecords
      .filter(r => r.state === 'OFF' && r.down_time > 15)
      .reduce((sum, r) => sum + r.down_time, 0);
      
    const totalStopTime = machineRecords
      .filter(r => r.state === 'OFF' && r.down_time <= 15)
      .reduce((sum, r) => sum + r.down_time, 0);

    // Calculate downtime statistics
    const downtimes = machineRecords
      .filter(r => r.state === 'OFF' && r.down_time > 15)
      .map(r => r.down_time);
      
    const avgDowntime = downtimes.length > 0 
      ? downtimes.reduce((sum, dt) => sum + dt, 0) / downtimes.length 
      : 0;
      
    const maxDowntime = downtimes.length > 0 
      ? Math.max(...downtimes) 
      : 0;

    return {
      motor_number,
      status,
      last_update: latestRecord.timestamp,
      total_uptime: totalUptime,
      total_downtime: totalDowntime,
      total_stop_time: totalStopTime,
      avg_downtime: avgDowntime,
      max_downtime: maxDowntime,
    };
  }).sort((a, b) => a.motor_number - b.motor_number);
}

export function getPredefinedTimeRanges(): TimeRange[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  return [
    {
      start: today,
      end: now,
      label: 'Today'
    },
    {
      start: yesterday,
      end: today,
      label: 'Yesterday'
    },
    {
      start: weekStart,
      end: now,
      label: 'This Week'
    },
    {
      start: monthStart,
      end: now,
      label: 'This Month'
    },
    {
      start: yearStart,
      end: now,
      label: 'Year to Date'
    }
  ];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}