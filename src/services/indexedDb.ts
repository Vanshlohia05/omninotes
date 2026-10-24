import { NoteItem, Folder, GDriveConfig } from '../types/note';
import { HabitItem, TaskItem, JournalBook, ParaItem, CrmContact } from '../types/lifeos';

const DB_NAME = 'omninotes_db';
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('folderId', 'folderId', { unique: false });
        noteStore.createIndex('isDeleted', 'isDeleted', { unique: false });
        noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('journals')) {
        db.createObjectStore('journals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('para')) {
        db.createObjectStore('para', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('crm')) {
        db.createObjectStore('crm', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const dbService = {
  async getAllNotes(): Promise<NoteItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('notes', 'readonly');
      const store = transaction.objectStore('notes');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveNote(note: NoteItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');
      const req = store.put(note);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveNotes(notes: NoteItem[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');
      notes.forEach((note) => store.put(note));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteNotePermanently(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getAllFolders(): Promise<Folder[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('folders', 'readonly');
      const store = transaction.objectStore('folders');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveFolder(folder: Folder): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('folders', 'readwrite');
      const store = transaction.objectStore('folders');
      const req = store.put(folder);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveFolders(folders: Folder[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('folders', 'readwrite');
      const store = transaction.objectStore('folders');
      folders.forEach((folder) => store.put(folder));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteFolder(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('folders', 'readwrite');
      const store = transaction.objectStore('folders');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value);
        } else {
          resolve(defaultValue);
        }
      };
      req.onerror = () => reject(req.error);
    });
  },

  async saveSetting<T>(key: string, value: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // Habits
  async getAllHabits(): Promise<HabitItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('habits', 'readonly');
      const store = transaction.objectStore('habits');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveHabit(habit: HabitItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('habits', 'readwrite');
      const store = transaction.objectStore('habits');
      const req = store.put(habit);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveHabits(habits: HabitItem[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('habits', 'readwrite');
      const store = transaction.objectStore('habits');
      habits.forEach((h) => store.put(h));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteHabit(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('habits', 'readwrite');
      const store = transaction.objectStore('habits');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // Tasks
  async getAllTasks(): Promise<TaskItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readonly');
      const store = transaction.objectStore('tasks');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveTask(task: TaskItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const req = store.put(task);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveTasks(tasks: TaskItem[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      tasks.forEach((t) => store.put(t));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteTask(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // Journals
  async getAllJournals(): Promise<JournalBook[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('journals', 'readonly');
      const store = transaction.objectStore('journals');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveJournal(journal: JournalBook): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('journals', 'readwrite');
      const store = transaction.objectStore('journals');
      const req = store.put(journal);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveJournals(journals: JournalBook[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('journals', 'readwrite');
      const store = transaction.objectStore('journals');
      journals.forEach((j) => store.put(j));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteJournal(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('journals', 'readwrite');
      const store = transaction.objectStore('journals');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // PARA
  async getAllParaItems(): Promise<ParaItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('para', 'readonly');
      const store = transaction.objectStore('para');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveParaItem(item: ParaItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('para', 'readwrite');
      const store = transaction.objectStore('para');
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveParaItems(items: ParaItem[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('para', 'readwrite');
      const store = transaction.objectStore('para');
      items.forEach((item) => store.put(item));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteParaItem(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('para', 'readwrite');
      const store = transaction.objectStore('para');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // CRM
  async getAllCrmContacts(): Promise<CrmContact[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('crm', 'readonly');
      const store = transaction.objectStore('crm');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async saveCrmContact(contact: CrmContact): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('crm', 'readwrite');
      const store = transaction.objectStore('crm');
      const req = store.put(contact);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveCrmContacts(contacts: CrmContact[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('crm', 'readwrite');
      const store = transaction.objectStore('crm');
      contacts.forEach((c) => store.put(c));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteCrmContact(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('crm', 'readwrite');
      const store = transaction.objectStore('crm');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
};
