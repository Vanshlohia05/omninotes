import React, { useState } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Check,
  AlertCircle,
  FolderArchive,
  RotateCcw
} from 'lucide-react';
import { NoteItem, Folder, GDriveConfig } from '../../types/note';
import { exportService } from '../../services/exportService';
import { notificationService } from '../../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  folders: Folder[];
  gdriveConfig: GDriveConfig;
  onUpdateGDriveConfig: (config: GDriveConfig) => void;
  onSyncDrive: () => void;
  onRestoreVault: (notes: NoteItem[], folders: Folder[]) => void;
  onResetSampleData: () => void;
  onEmptyTrash: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  notes,
  folders,
  gdriveConfig,
  onUpdateGDriveConfig,
  onSyncDrive,
  onRestoreVault,
  onResetSampleData,
  onEmptyTrash
}) => {
  const [clientId, setClientId] = useState(gdriveConfig.clientId || '');
  const [notifGranted, setNotifGranted] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveDriveConfig = () => {
    onUpdateGDriveConfig({
      ...gdriveConfig,
      clientId: clientId.trim()
    });
  };

  const handleRequestNotif = async () => {
    const granted = await notificationService.requestPermission();
    setNotifGranted(granted);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.notes && Array.isArray(parsed.notes)) {
          onRestoreVault(parsed.notes, parsed.folders || []);
          setImportStatus(`Successfully restored ${parsed.notes.length} notes!`);
        } else {
          setImportStatus('Invalid backup file format');
        }
      } catch (err) {
        setImportStatus('Error reading backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#252525] p-6 shadow-apple-floating border border-black/10 dark:border-white/10 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
            <Cloud className="w-5 h-5 text-amber-500" />
            Settings & Google Drive Vault
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Google Drive Sync */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Google Drive Cloud Sync</span>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-medium">
                PWA & Phone Ready
              </span>
            </div>
            {gdriveConfig.isAuthorized ? (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Local-first mode</span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            OmniNotes stores everything in local IndexedDB (0ms latency, always works offline). To sync across your phone and desktop, connect your Google Drive OAuth Client ID below.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Google OAuth 2.0 Client ID (Optional for Cloud Sync)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="apps.googleusercontent.com Client ID..."
                className="flex-1 text-xs p-2 rounded-lg bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-[11px]"
              />
              <button
                onClick={handleSaveDriveConfig}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-800 dark:text-slate-100 transition"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-400">
              {gdriveConfig.lastSyncedAt
                ? `Last synced: ${new Date(gdriveConfig.lastSyncedAt).toLocaleTimeString()}`
                : 'Never synced'}
            </div>
            <button
              onClick={onSyncDrive}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync to Drive Now
            </button>
          </div>
        </div>

        {/* Section 2: Universal Vault Backup & Restore (Zero-Config Phone Transfer) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 space-y-3">
          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <FolderArchive className="w-4 h-4 text-indigo-500" />
            <span>Vault Backup & Device Transfer</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Download your entire knowledge base (notes, folders, diagrams, mind maps) as a standalone JSON backup file. You can AirDrop, email, or send this file to your phone to restore instantly!
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => exportService.exportVaultBackup(notes, folders)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-slate-200 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              Download Vault Backup
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-slate-200 transition shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              Restore from Backup
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
              {importStatus}
            </div>
          )}
        </div>

        {/* Section 3: Notification Permissions */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">Web Notifications</div>
              <div className="text-[11px] text-slate-400">
                {notifGranted ? 'Granted (reminders enabled)' : 'Permission required for alerts'}
              </div>
            </div>
          </div>
          {!notifGranted && (
            <button
              onClick={handleRequestNotif}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition"
            >
              Enable
            </button>
          )}
        </div>

        {/* Section 4: Data Actions (Empty Trash & Reset Samples) */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => {
              if (confirm('Permanently purge all notes in Recently Deleted?')) {
                onEmptyTrash();
              }
            }}
            className="text-red-500 hover:text-red-600 font-medium transition"
          >
            Empty Recently Deleted
          </button>

          <button
            onClick={() => {
              if (confirm('Reset to sample starter notes? (This will add default showcase notes)')) {
                onResetSampleData();
              }
            }}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Sample Notes
          </button>
        </div>
      </div>
    </div>
  );
};
