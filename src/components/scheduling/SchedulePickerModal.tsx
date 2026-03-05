"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Clock } from "lucide-react";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface SchedulePickerModalProps {
  fixerId: string;
  fixerName: string;
  onConfirm: (scheduledAt: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const DAY_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

const DAY_LABELS: Record<string, string> = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday",
  THU: "Thursday", FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};

// Generate 1-hour time slots between start and end
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);

  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

// Get the next 7 days that match available days
function getAvailableDates(availability: AvailabilitySlot[]): { date: Date; day: string; slots: AvailabilitySlot[] }[] {
  const result: { date: Date; day: string; slots: AvailabilitySlot[] }[] = [];
  const today = new Date();

  for (let i = 1; i <= 14 && result.length < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const jsDay = date.getDay(); // 0=Sun

    // Find matching day code
    const dayCode = Object.entries(DAY_NAMES).find(([, num]) => num === jsDay)?.[0];
    if (!dayCode) continue;

    const daySlots = availability.filter((s) => s.day === dayCode);
    if (daySlots.length > 0) {
      result.push({ date, day: dayCode, slots: daySlots });
    }
  }

  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function SchedulePickerModal({
  fixerId,
  fixerName,
  onConfirm,
  onSkip,
  onClose,
}: SchedulePickerModalProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/fixers/${fixerId}/availability`)
      .then((res) => res.json())
      .then((data) => {
        setAvailability(data.availability || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fixerId]);

  const availableDates = getAvailableDates(availability);

  const selectedDate = selectedDateIdx !== null ? availableDates[selectedDateIdx] : null;

  // Combine all time slots for the selected date
  const timeSlots = selectedDate
    ? selectedDate.slots.flatMap((s) => generateTimeSlots(s.startTime, s.endTime))
    : [];

  // Remove duplicates and sort
  const uniqueTimeSlots = [...new Set(timeSlots)].sort();

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const date = new Date(selectedDate.date);
    const [h, m] = selectedTime.split(":").map(Number);
    date.setHours(h, m, 0, 0);
    onConfirm(date.toISOString());
  };

  // No availability set → offer to skip
  if (!loading && availability.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Schedule appointment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            {fixerName} hasn't set their available hours yet. You can accept the offer now and arrange a time via chat.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Accept anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Pick a time</h3>
            <p className="text-sm text-gray-500">Choose when {fixerName} should come</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading availability...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Date Selection */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4" />
                Select a date
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableDates.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedDateIdx(i);
                      setSelectedTime(null);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedDateIdx === i
                        ? "bg-primary text-white shadow-sm"
                        : "border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {formatDate(d.date)}
                  </button>
                ))}
              </div>
              {availableDates.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No available dates in the next 2 weeks.
                </p>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                  <Clock className="w-4 h-4" />
                  Select a time ({DAY_LABELS[selectedDate.day]})
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {uniqueTimeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-primary text-white shadow-sm"
                          : "border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 pt-4 border-t flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Skip scheduling
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm & accept
          </button>
        </div>
      </div>
    </div>
  );
}
