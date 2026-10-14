import React, { useState } from 'react';
import { X, Clock, Bell, Trash2 } from 'lucide-react';
import { Reminder } from '../../types/note';
import { notificationService } from '../../services/notificationService';

interface ReminderModalProps {
  isOpen: boolean;
  currentReminder?: Reminder | null;
  onSave: (reminder: Reminder | null) => void;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  currentReminder,
  onSave,
  onClose
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(currentReminder?.date || defaultDate);
  const [time, setTime] = useState(currentReminder?.time || '09:00');

  if (!isOpen) return null;

  const handleSave = async () => {
    await notificationService.requestPermission();
    onSave({
      date,
      time,
      notified: false
    });
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#252525] p-5 shadow-apple-floating border border-black/10 dark:border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            Set Note Reminder
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Reminder Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-medium">Reminder Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2 text-amber-800 dark:text-amber-200 text-[11px]">
            <Bell className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Web Notifications will alert you when the scheduled time arrives across desktop and mobile.</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {currentReminder ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition"
            >
              Set Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
