import React from 'react';
import { Calendar, Plus, CheckCircle2, Clock, CircleDot, Flag } from 'lucide-react';
import { NoteItem, TimelineEvent, BlockItem } from '../../types/note';

interface TimelineViewProps {
  note: NoteItem;
  onChange: (updatedBlocks: BlockItem[]) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ note, onChange }) => {
  // Find or create timeline block
  const timelineBlockIndex = note.blocks.findIndex((b) => b.type === 'timeline');
  const timelineBlock = timelineBlockIndex !== -1 ? note.blocks[timelineBlockIndex] : null;

  const events: TimelineEvent[] = timelineBlock?.timelineEvents || [
    {
      id: 'ev-init-1',
      date: new Date(note.createdAt).toISOString().split('T')[0],
      title: note.title || 'Note Created',
      description: 'Initial concept and notes recorded.',
      status: 'completed'
    },
    {
      id: 'ev-init-2',
      date: new Date().toISOString().split('T')[0],
      title: 'Current Review & Iteration',
      description: 'Active progress and development.',
      status: 'in-progress'
    },
    {
      id: 'ev-init-3',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      title: 'Target Completion',
      description: 'Deliverables finalized and archived.',
      status: 'planned'
    }
  ];

  const handleUpdateEvents = (updatedEvents: TimelineEvent[]) => {
    if (timelineBlockIndex !== -1) {
      const newBlocks = [...note.blocks];
      newBlocks[timelineBlockIndex] = {
        ...newBlocks[timelineBlockIndex],
        timelineEvents: updatedEvents
      };
      onChange(newBlocks);
    } else {
      const newTimelineBlock: BlockItem = {
        id: `b-timeline-${Date.now()}`,
        type: 'timeline',
        content: 'Project Timeline',
        timelineEvents: updatedEvents
      };
      onChange([...note.blocks, newTimelineBlock]);
    }
  };

  const handleAddMilestone = () => {
    const newEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: 'New Milestone',
      description: 'Key deliverable or event goal...',
      status: 'planned'
    };
    handleUpdateEvents([...events, newEvent]);
  };

  const handleCycleStatus = (index: number) => {
    const ev = events[index];
    const nextStatus: TimelineEvent['status'] =
      ev.status === 'completed'
        ? 'in-progress'
        : ev.status === 'in-progress'
        ? 'planned'
        : 'completed';
    const updated: TimelineEvent[] = events.map((e, i) => (i === index ? { ...e, status: nextStatus } : e));
    handleUpdateEvents(updated);
  };

  const handleUpdateField = (index: number, field: keyof TimelineEvent, val: string) => {
    const updated = events.map((e, i) => (i === index ? { ...e, [field]: val } : e));
    handleUpdateEvents(updated);
  };

  const handleDelete = (index: number) => {
    if (events.length <= 1) return;
    handleUpdateEvents(events.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-blue-500/10 border border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Interactive Timeline & Roadmap
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize chronological milestones, deadlines, and project progression.
          </p>
        </div>
        <button
          onClick={handleAddMilestone}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Milestone
        </button>
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-neutral-800">
        {events.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Dot with Pulse */}
            <button
              onClick={() => handleCycleStatus(idx)}
              className={`absolute -left-8 top-1.5 w-5 h-5 rounded-full border-2 border-white dark:border-[#181818] flex items-center justify-center transition shadow-sm ${
                event.status === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : event.status === 'in-progress'
                  ? 'bg-amber-500 text-white ring-4 ring-amber-400/20'
                  : 'bg-blue-500 text-white'
              }`}
              title="Click to cycle status"
            >
              {event.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
              {event.status === 'in-progress' && <Clock className="w-3 h-3" />}
              {event.status === 'planned' && <CircleDot className="w-3 h-3" />}
            </button>

            {/* Event Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#202020] border border-black/10 dark:border-white/10 shadow-sm space-y-2.5 transition hover:shadow-md">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => handleUpdateField(idx, 'date', e.target.value)}
                  className="text-xs font-mono font-semibold bg-slate-100 dark:bg-neutral-900 px-2 py-1 rounded-lg border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-200 focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <span
                    onClick={() => handleCycleStatus(idx)}
                    className={`cursor-pointer text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      event.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : event.status === 'in-progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {event.status}
                  </span>

                  {events.length > 1 && (
                    <button
                      onClick={() => handleDelete(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition"
                      title="Delete milestone"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={event.title}
                onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                placeholder="Milestone title..."
                className="w-full font-bold text-sm text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
              />

              <textarea
                rows={2}
                value={event.description}
                onChange={(e) => handleUpdateField(idx, 'description', e.target.value)}
                placeholder="Milestone deliverables and progress description..."
                className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent resize-none focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
