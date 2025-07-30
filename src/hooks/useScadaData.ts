import { useState, useEffect } from 'react';
import { MachineStatusRecord, MachineData, TimeRange } from '@/types/scada';
import { aggregateMachineData } from '@/lib/scada-utils';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration - will be replaced with real Supabase data
const generateMockData = (): MachineStatusRecord[] => {
  const records: MachineStatusRecord[] = [];
  const now = new Date();
  
  // Generate data for 20 machines over the last 24 hours
  for (let motor = 1; motor <= 20; motor++) {
    for (let hour = 24; hour >= 0; hour--) {
      const timestamp = new Date(now.getTime() - hour * 60 * 60 * 1000);
      const isOn = Math.random() > 0.3; // 70% chance machine is on
      const downTime = isOn ? 0 : Math.random() * 60; // 0-60 minutes down time
      
      records.push({
        timestamp: timestamp.toISOString(),
        motor_number: motor,
        state: isOn ? 'ON' : 'OFF',
        stop_time: isOn ? Math.random() * 30 : 0, // 0-30 minutes stop time when on
        down_time: downTime,
      });
    }
  }
  
  return records;
};

export function useScadaData(timeRange?: TimeRange) {
  const [records, setRecords] = useState<MachineStatusRecord[]>([]);
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockRecords = generateMockData();
        setRecords(mockRecords);

        toast({
          title: 'Data Loaded',
          description: 'Mock SCADA data loaded. Connect to Supabase for real data.',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, toast]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update a machine status
      const motorNumber = Math.floor(Math.random() * 20) + 1;
      const isOn = Math.random() > 0.5;
      
      const newRecord: MachineStatusRecord = {
        timestamp: new Date().toISOString(),
        motor_number: motorNumber,
        state: isOn ? 'ON' : 'OFF',
        stop_time: isOn ? Math.random() * 30 : 0,
        down_time: isOn ? 0 : Math.random() * 60,
      };

      setRecords(prev => [newRecord, ...prev.slice(0, 1000)]); // Keep last 1000 records
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Update aggregated machine data when records change
  useEffect(() => {
    if (records.length > 0) {
      const aggregatedData = aggregateMachineData(records, timeRange);
      setMachines(aggregatedData);
    }
  }, [records, timeRange]);

  const refetch = async () => {
    setLoading(true);
    setRecords([]);
  };

  return {
    records,
    machines,
    loading,
    error,
    refetch
  };
}