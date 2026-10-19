import { Injectable } from '@angular/core';

/**
 * Small utility for triggering browser file downloads.
 * Used by the marketing checkout to save the credentials `.txt`.
 */
@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  /**
   * Download a plain-text file to the user's machine.
   * Works in every modern browser via a temporary Blob URL.
   */
  downloadText(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /** Copy a string to the clipboard, falling back to text-selection. */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* fall through */ }
    return false;
  }
}
