import React from 'react';
import { Plus, Trash2, CheckCircle2, Clock, CircleDot, Calendar } from 'lucide-react';
import { TimelineEvent } from '../../types/note';

interface TimelineBlockProps {
  events?: TimelineEvent[];
  onChange: (updatedEvents: TimelineEvent[]) => void;
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({ events = [], onChange }) => {
  const currentEvents: TimelineEvent[] = events.length > 0
    ? events
    : [
        {
          id: `ev-${Date.now()}-1`,
          date: new Date().toISOString().split('T')[0],
          title: 'Project Kickoff',
          description: 'Initial scope, architecture, and workspace initialization.',
          status: 'completed'
        },
        {
          id: `ev-${Date.now()}-2`,
          date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          title: 'Core Development & Integration',
          description: 'Modular blocks, spatial canvas, and cloud sync engine.',
          status: 'in-progress'
        },
        {
          id: `ev-${Date.now()}-3`,
          date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          title: 'Testing & Release',
          description: 'Comprehensive cross-device validation and launch.',
          status: 'planned'
        }
      ];

  const handleAddEvent = () => {
    const newEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: 'New Milestone',
      description: 'Describe milestone objectives and deliverables...',
      status: 'planned'
    };
    onChange([...currentEvents, newEvent]);
  };

  const handleUpdateEvent = (index: number, updated: Partial<TimelineEvent>) => {
    const updatedList = currentEvents.map((ev, i) => (i === index ? { ...ev, ...updated } : ev));
    onChange(updatedList);
  };

  const handleDeleteEvent = (index: number) => {
    if (currentEvents.length <= 1) return;
    onChange(currentEvents.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: TimelineEvent['status'], index: number) => {
    switch (status) {
      case 'completed':
        return (
          <button
            onClick={() => handleUpdateEvent(index, { status: 'in-progress' })}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 transition hover:opacity-80"
            title="Click to cycle status"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </button>
        );
      case 'in-progress':
        return (
          <button
            onClick={() => handleUpdateEvent(index, { status: 'planned' })}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 transition hover:opacity-80"
            title="Click to cycle status"
          >
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </button>
        );
      case 'planned':
      default:
        return (
          <button
            onClick={() => handleUpdateEvent(index, { status: 'completed' })}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 transition hover:opacity-80"
            title="Click to cycle status"
          >
            <CircleDot className="w-3 h-3" />
            <span>Planned</span>
          </button>
        );
    }
  };

  return (
    <div className="my-4 p-4 rounded-2xl bg-white dark:bg-[#202020] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Project Timeline & Milestones</h4>
        </div>
        <button
          onClick={handleAddEvent}
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2.5 py-1 rounded-lg transition font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Milestone
        </button>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-neutral-800">
        {currentEvents.map((event, index) => (
          <div key={event.id || index} className="relative group">
            {/* Timeline Node Dot */}
            <div
              className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#202020] shadow-sm transition ${
                event.status === 'completed'
                  ? 'bg-emerald-500'
                  : event.status === 'in-progress'
                  ? 'bg-amber-500 ring-2 ring-amber-400/30'
                  : 'bg-blue-400'
              }`}
            />

            <div className="bg-slate-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={event.date}
                    onChange={(e) => handleUpdateEvent(index, { date: e.target.value })}
                    className="text-xs font-mono font-medium bg-white dark:bg-neutral-900 px-2 py-0.5 rounded border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                  {getStatusBadge(event.status, index)}
                </div>

                {currentEvents.length > 1 && (
                  <button
                    onClick={() => handleDeleteEvent(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={event.title}
                onChange={(e) => handleUpdateEvent(index, { title: e.target.value })}
                placeholder="Milestone title..."
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none placeholder:text-slate-400"
              />

              <textarea
                rows={2}
                value={event.description}
                onChange={(e) => handleUpdateEvent(index, { description: e.target.value })}
                placeholder="Details, deliverable objectives, dependencies..."
                className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent resize-none focus:outline-none placeholder:text-slate-400 leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
