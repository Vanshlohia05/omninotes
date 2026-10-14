import { NoteItem } from '../types/note';

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this browser.');
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  checkReminders(notes: NoteItem[], onNotify: (note: NoteItem) => void) {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    for (const note of notes) {
      if (
        !note.isDeleted &&
        note.reminder &&
        !note.reminder.notified &&
        note.reminder.date <= currentDate &&
        note.reminder.time <= currentTime
      ) {
        this.triggerNotification(note);
        onNotify({
          ...note,
          reminder: {
            ...note.reminder,
            notified: true
          }
        });
      }
    }
  },

  triggerNotification(note: NoteItem) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Reminder: ${note.title || 'Untitled Note'}`, {
        body: note.blocks[0]?.content || 'You scheduled a reminder for this note.',
        icon: '📝'
      });
    }
  }
};
