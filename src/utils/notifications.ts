import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Medication } from '../types';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Erinnerungen laufen in der Android-App über lokale System-Benachrichtigungen
 * (funktionieren auch bei geschlossener App). Im Browser gibt es keine
 * zuverlässige Hintergrund-Planung – dort wird nur der Status gemeldet.
 */
export function notificationsSupported(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getPermissionState(): Promise<PermissionState> {
  if (!notificationsSupported()) return 'unsupported';
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return 'granted';
    if (display === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch {
    return false;
  }
}

// Stabile 31-Bit-ID aus Medikament + Uhrzeit, damit Neu-Planen alte Termine ersetzt
function reminderId(medId: string, time: string): number {
  const s = `${medId}|${time}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483647 || 1;
}

/**
 * Plant alle täglichen Erinnerungen neu. Wird nach jeder Änderung an den
 * Medikamenten aufgerufen; scheitert still, damit die App nie daran hängt.
 */
export async function syncMedicationReminders(medications: Medication[]): Promise<void> {
  if (!notificationsSupported()) return;
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') return;

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }

    const notifications = medications
      .filter((m) => m.active)
      .flatMap((m) => m.times.map((time) => {
        const [hour, minute] = time.split(':').map(Number);
        return {
          id: reminderId(m.id, time),
          title: `💊 ${m.name}`,
          body: m.dose ? `${m.dose} – Zeit für Ihre Einnahme` : 'Zeit für Ihre Einnahme',
          schedule: { on: { hour, minute }, allowWhileIdle: true },
          smallIcon: 'ic_launcher_foreground',
        };
      }));

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (error) {
    console.warn('Erinnerungen konnten nicht geplant werden:', error);
  }
}
