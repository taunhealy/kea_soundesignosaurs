import { useState } from 'react';
import { Calendar } from '@/app/components/ui/calendar';
import { Button } from '@/app/components/ui/button';

interface BookedDatesCalendarProps {
  initialBookedDates: Date[];
  onSave: (bookedDates: Date[]) => void;
}

export function BookedDatesCalendar({ initialBookedDates, onSave }: BookedDatesCalendarProps) {
  const [bookedDates, setBookedDates] = useState<Date[]>(initialBookedDates);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setBookedDates(prev => 
        prev.some(d => d.toDateString() === date.toDateString())
          ? prev.filter(d => d.toDateString() !== date.toDateString())
          : [...prev, date]
      );
    }
  };

  const handleSave = () => {
    onSave(bookedDates);
  };

  return (
    <div>
      <Calendar
        mode="multiple"
        selected={bookedDates}
        onSelect={handleSelect}
        className="rounded-md border"
      />
      <Button onClick={handleSave} className="mt-4">Save Booked Dates</Button>
    </div>
  );
}

