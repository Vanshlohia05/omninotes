import React, { useState } from 'react';
import {
  Users,
  Plus,
  ChevronLeft,
  Calendar,
  Clock,
  Gift,
  MessageSquare,
  Phone,
  Coffee,
  CheckCircle2,
  Trash2,
  Heart,
  Tag
} from 'lucide-react';
import {
  CrmContact,
  RelationshipTier,
  CatchUpCadence,
  getDaysUntilBirthday
} from '../../types/lifeos';

interface PersonalCRMViewProps {
  contacts: CrmContact[];
  onSaveContact: (contact: CrmContact) => void;
  onDeleteContact: (id: string) => void;
  onBackToNotes?: () => void;
  onOpenSidebar?: () => void;
}

const TIERS: { tier: RelationshipTier; label: string; color: string }[] = [
  { tier: 'family', label: 'Family', color: '#EC4899' },
  { tier: 'close_friend', label: 'Close Friend', color: '#F59E0B' },
  { tier: 'friend', label: 'Friend', color: '#3B82F6' },
  { tier: 'mentor', label: 'Mentor', color: '#8B5CF6' },
  { tier: 'professional', label: 'Professional', color: '#10B981' },
  { tier: 'acquaintance', label: 'Acquaintance', color: '#64748B' }
];

export const PersonalCRMView: React.FC<PersonalCRMViewProps> = ({
  contacts,
  onSaveContact,
  onDeleteContact,
  onBackToNotes,
  onOpenSidebar
}) => {
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | RelationshipTier>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('👤');
  const [newTier, setNewTier] = useState<RelationshipTier>('friend');
  const [newCadence, setNewCadence] = useState<CatchUpCadence>('monthly');
  const [newBirthday, setNewBirthday] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredContacts = contacts.filter((c) => {
    if (activeTierFilter === 'all') return true;
    return c.tier === activeTierFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const cadenceMap: Record<CatchUpCadence, number> = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };

    const newContact: CrmContact = {
      id: `crm-${Date.now()}`,
      name: newName.trim(),
      avatar: newAvatar,
      tier: newTier,
      cadence: newCadence,
      cadenceDays: cadenceMap[newCadence],
      birthday: newBirthday || undefined,
      notes: newNotes.trim() || undefined,
      giftIdeas: [],
      topicsToDiscuss: [],
      interactions: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSaveContact(newContact);
    setNewName('');
    setNewBirthday('');
    setNewNotes('');
    setIsCreating(false);
  };

  const handleLogCatchUp = (contact: CrmContact) => {
    const today = new Date().toISOString().split('T')[0];
    const newInteraction = {
      id: `inter-${Date.now()}`,
      date: today,
      type: 'coffee' as const,
      notes: 'Caught up today.'
    };

    onSaveContact({
      ...contact,
      lastCatchUpDate: today,
      interactions: [newInteraction, ...contact.interactions],
      updatedAt: Date.now()
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFB] dark:bg-[#181818] min-w-0">
      {/* Top Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-neutral-900/70 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          {onBackToNotes && (
            <button
              onClick={onBackToNotes}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
              title="Back to Notes"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Personal Relationship CRM
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono">
                {contacts.length} Contacts
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Nurture relationships, track communication cadence & never miss birthdays
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Tier Filter Pills */}
      <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-neutral-900/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs shrink-0">
        <button
          onClick={() => setActiveTierFilter('all')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition ${
            activeTierFilter === 'all'
              ? 'bg-rose-600 text-white shadow-sm font-semibold'
              : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          All Contacts ({contacts.length})
        </button>
        {TIERS.map((t) => {
          const count = contacts.filter((c) => c.tier === t.tier).length;
          const isActive = activeTierFilter === t.tier;
          return (
            <button
              key={t.tier}
              onClick={() => setActiveTierFilter(t.tier)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Contacts Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {/* Create Contact Modal / Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 rounded-2xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Add New Contact
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                required
                placeholder="Full Name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-2 px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as RelationshipTier)}
                className="px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {TIERS.map((t) => (
                  <option key={t.tier} value={t.tier}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={newCadence}
                onChange={(e) => setNewCadence(e.target.value as CatchUpCadence)}
                className="px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Birthday:</span>
                <input
                  type="text"
                  placeholder="MM-DD (e.g. 11-04)"
                  value={newBirthday}
                  onChange={(e) => setNewBirthday(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100"
                />
              </div>
              <input
                type="text"
                placeholder="Personal notes & interests..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredContacts.map((contact) => {
            const daysUntilBday = getDaysUntilBirthday(contact.birthday);
            const tierInfo = TIERS.find((t) => t.tier === contact.tier);

            return (
              <div
                key={contact.id}
                className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{contact.avatar || '👤'}</span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {contact.name}
                        </h3>
                        <span
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${tierInfo?.color || '#3B82F6'}15`,
                            color: tierInfo?.color || '#3B82F6'
                          }}
                        >
                          {tierInfo?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {daysUntilBday !== null && daysUntilBday <= 14 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          🎂 in {daysUntilBday}d
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteContact(contact.id)}
                        className="text-slate-300 group-hover:text-red-500 transition p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Cadence:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {contact.cadence}
                      </span>
                    </div>
                    {contact.lastCatchUpDate && (
                      <div className="flex justify-between text-[11px]">
                        <span>Last Contact:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {contact.lastCatchUpDate}
                        </span>
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {contact.interactions.length} interactions
                  </span>
                  <button
                    onClick={() => handleLogCatchUp(contact)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 transition"
                  >
                    <Coffee className="w-3 h-3" />
                    <span>Log Catch-up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
