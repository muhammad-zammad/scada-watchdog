export interface MachineStatusRecord {
  timestamp: string;
  motor_number: number;
  state: 'ON' | 'OFF';
  stop_time: number;
  down_time: number;
}

export type MachineStatus = 'Running' | 'Stopped' | 'Down';

export interface MachineData {
  motor_number: number;
  status: MachineStatus;
  last_update: string;
  total_uptime: number;
  total_downtime: number;
  total_stop_time: number;
  avg_downtime: number;
  max_downtime: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export interface ExportData {
  machine_id: number;
  status: string;
  uptime_hours: number;
  downtime_hours: number;
  stop_time_hours: number;
  avg_downtime_minutes: number;
  max_downtime_minutes: number;
  last_update: string;
}