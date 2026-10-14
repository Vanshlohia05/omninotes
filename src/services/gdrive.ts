import { NoteItem, Folder, GDriveConfig } from '../types/note';

declare global {
  interface Window {
    google?: any;
  }
}

const DRIVE_FILE_NAME = 'omninotes_vault.json';
const DRIVE_FOLDER_NAME = 'OmniNotes_Vault';

export const gdriveService = {
  /**
   * Initializes Google Identity Services token client
   */
  initTokenClient(
    clientId: string,
    callback: (tokenResponse: any) => void
  ): any {
    if (!window.google?.accounts?.oauth2) {
      console.warn('Google Identity Services script not yet loaded.');
      return null;
    }

    return window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: callback
    });
  },

  /**
   * Searches for existing OmniNotes folder or creates one
   */
  async getOrCreateVaultFolder(accessToken: string): Promise<string> {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER_NAME}' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&spaces=drive`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    const createData = await createRes.json();
    return createData.id;
  },

  /**
   * Finds the vault file ID inside the folder
   */
  async findVaultFile(accessToken: string, folderId: string): Promise<string | null> {
    const q = `'${folderId}' in parents and name='${DRIVE_FILE_NAME}' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&spaces=drive`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  },

  /**
   * Downloads remote vault payload from Google Drive
   */
  async downloadVault(accessToken: string, fileId: string): Promise<{ notes: NoteItem[]; folders: Folder[]; lastUpdated: number } | null> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return null;
    return await res.json();
  },

  /**
   * Uploads vault payload to Google Drive (creates or updates)
   */
  async uploadVault(
    accessToken: string,
    notes: NoteItem[],
    folders: Folder[]
  ): Promise<{ fileId: string; timestamp: number }> {
    const folderId = await this.getOrCreateVaultFolder(accessToken);
    const existingFileId = await this.findVaultFile(accessToken, folderId);

    const payload = {
      version: '1.0.0',
      lastUpdated: Date.now(),
      folders,
      notes
    };
    const bodyContent = JSON.stringify(payload, null, 2);

    if (existingFileId) {
      // Update file content
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
      const res = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: bodyContent
      });
      if (!res.ok) throw new Error('Failed to update Google Drive file');
      return { fileId: existingFileId, timestamp: payload.lastUpdated };
    } else {
      // Create multipart file upload
      const metadata = {
        name: DRIVE_FILE_NAME,
        parents: [folderId],
        mimeType: 'application/json'
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        bodyContent +
        closeDelim;

      const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });
      if (!res.ok) throw new Error('Failed to create file on Google Drive');
      const data = await res.json();
      return { fileId: data.id, timestamp: payload.lastUpdated };
    }
  }
};
