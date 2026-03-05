"use client";

import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";

const DAYS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
] as const;

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityEditorProps {
  slots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
}

export default function AvailabilityEditor({ slots, onChange }: AvailabilityEditorProps) {
  const [error, setError] = useState("");

  const addSlot = (day: string) => {
    setError("");
    // Default 9-17 for new slot
    const existing = slots.filter((s) => s.day === day);
    if (existing.length >= 3) {
      setError(`Max 3 time slots per day`);
      return;
    }
    onChange([...slots, { day, startTime: "09:00", endTime: "17:00" }]);
  };

  const removeSlot = (index: number) => {
    setError("");
    onChange(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: "startTime" | "endTime", value: string) => {
    setError("");
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };

    if (updated[index].startTime >= updated[index].endTime) {
      setError("End time must be after start time");
      return;
    }

    onChange(updated);
  };

  // Group slots by day for display
  const slotsByDay = DAYS.map((day) => ({
    ...day,
    slots: slots
      .map((s, i) => ({ ...s, originalIndex: i }))
      .filter((s) => s.day === day.value),
  }));

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <Clock className="w-4 h-4" />
        Available hours
      </label>
      <p className="text-xs text-gray-500 mb-4">
        Set your working hours so customers can schedule a time when accepting your offer.
      </p>

      <div className="space-y-2">
        {slotsByDay.map((day) => (
          <div
            key={day.value}
            className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
          >
            {/* Day label */}
            <div className="w-10 pt-1.5 text-sm font-semibold text-gray-700 flex-shrink-0">
              {day.label}
            </div>

            {/* Slots */}
            <div className="flex-1 space-y-1.5">
              {day.slots.length === 0 ? (
                <span className="text-xs text-gray-400 leading-8">Not available</span>
              ) : (
                day.slots.map((slot) => (
                  <div key={slot.originalIndex} className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(slot.originalIndex, "startTime", e.target.value)}
                      className="px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent w-[110px]"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(slot.originalIndex, "endTime", e.target.value)}
                      className="px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent w-[110px]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.originalIndex)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add button */}
            <button
              type="button"
              onClick={() => addSlot(day.value)}
              className="p-1.5 text-gray-400 hover:text-primary transition-colors flex-shrink-0 mt-0.5"
              title={`Add time slot for ${day.label}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      {/* Quick fill buttons */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => {
            setError("");
            const weekdays = ["MON", "TUE", "WED", "THU", "FRI"].map((day) => ({
              day,
              startTime: "09:00",
              endTime: "17:00",
            }));
            onChange(weekdays);
          }}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded-full hover:border-primary hover:text-primary transition-colors"
        >
          Mon-Fri 9-17
        </button>
        <button
          type="button"
          onClick={() => {
            setError("");
            onChange([]);
          }}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded-full hover:border-red-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
