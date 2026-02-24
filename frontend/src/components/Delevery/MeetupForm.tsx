import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
interface MeetupFormProps {
  onSave: (data: {location: string;date: string;time: string;}) => void;
  disabled?: boolean;
  initialData?: {
    location: string;
    date: string;
    time: string;
  };
}
export function MeetupForm({ onSave, initialData, disabled = false }: MeetupFormProps) {
  const [location, setLocation] = useState(initialData?.location || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [timeError, setTimeError] = useState<string | undefined>();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const loc = location.trim();
    const locErr = !loc ? 'Meetup location is required' : undefined;
    const dErr = !date ? 'Date is required' : undefined;
    const tErr = !time ? 'Time is required' : undefined;
    setLocationError(locErr);
    setDateError(dErr);
    setTimeError(tErr);
    if (locErr || dErr || tErr) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave({
      location: loc,
      date,
      time
    });
    setLoading(false);
  };
  const formatPreview = () => {
    if (!date || !time) return null;
    const dateObj = new Date(date + 'T' + time);
    const dayName = dateObj.toLocaleDateString('en-US', {
      weekday: 'long'
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    return `${dayName} ${timeStr}`;
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        y: -20
      }}
      transition={{
        duration: 0.3
      }}>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Meetup Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Meetup Location"
            placeholder="e.g., SLIIT Malabe - Main Gate"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (e.target.value.trim()) setLocationError(undefined);
            }}
            error={locationError}
            icon={<MapPinIcon className="h-5 w-5" />}
            disabled={disabled}
            required />


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (e.target.value) setDateError(undefined);
              }}
              error={dateError}
              icon={<CalendarIcon className="h-5 w-5" />}
              disabled={disabled}
              required />


            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (e.target.value) setTimeError(undefined);
              }}
              error={timeError}
              icon={<ClockIcon className="h-5 w-5" />}
              disabled={disabled}
              required />

          </div>

          {formatPreview() &&
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Meetup scheduled:</p>
              <p className="text-base font-medium text-green-700">
                {formatPreview()}
              </p>
            </div>
          }

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={disabled}
            loading={loading}>

            Save Logistics
          </Button>
        </form>
      </Card>
    </motion.div>);

}
