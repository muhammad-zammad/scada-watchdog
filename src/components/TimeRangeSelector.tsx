import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeRange } from '@/types/scada';
import { getPredefinedTimeRanges } from '@/lib/scada-utils';

interface TimeRangeSelectorProps {
  selectedRange?: TimeRange;
  onRangeChange: (range: TimeRange | undefined) => void;
}

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();
  const [showCustom, setShowCustom] = useState(false);

  const predefinedRanges = getPredefinedTimeRanges();

  const handlePredefinedRange = (range: TimeRange) => {
    onRangeChange(range);
    setShowCustom(false);
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const customRange: TimeRange = {
        start: customStart,
        end: customEnd,
        label: `${format(customStart, 'MMM dd')} - ${format(customEnd, 'MMM dd')}`
      };
      onRangeChange(customRange);
      setShowCustom(false);
    }
  };

  const clearRange = () => {
    onRangeChange(undefined);
    setCustomStart(undefined);
    setCustomEnd(undefined);
    setShowCustom(false);
  };

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Range Filter
          {selectedRange && (
            <Badge variant="secondary" className="ml-auto">
              {selectedRange.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Ranges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {predefinedRanges.map((range) => (
            <Button
              key={range.label}
              variant={selectedRange?.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => handlePredefinedRange(range)}
              className="text-xs"
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Custom Range Toggle */}
        <div className="flex gap-2">
          <Button
            variant={showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
          >
            Custom Range
          </Button>
          
          {selectedRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearRange}
            >
              Clear Filter
            </Button>
          )}
        </div>

        {/* Custom Date Pickers */}
        {showCustom && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStart ? format(customStart, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStart}
                    onSelect={setCustomStart}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEnd ? format(customEnd, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEnd}
                    onSelect={setCustomEnd}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Apply</label>
              <Button
                onClick={handleCustomRange}
                disabled={!customStart || !customEnd}
                className="w-full"
              >
                Apply Range
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}