import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Datei an den Nutzer ausliefern.
 * Im Browser: klassischer Download. In der Android-App gibt es keinen
 * Download-Manager im WebView – dort wird die Datei in den App-Cache
 * geschrieben und über den System-Teilen-Dialog angeboten (Drive, E-Mail, …).
 */
export async function saveFile(filename: string, blob: Blob): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const data = await blobToBase64(blob);
    const written = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
    await Share.share({ title: filename, url: written.uri, dialogTitle: 'Datei speichern oder teilen' });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
