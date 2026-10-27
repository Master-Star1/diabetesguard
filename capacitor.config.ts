import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.diabetesguard.app',
  appName: 'DiabetesGuard',
  webDir: 'dist',
  ios: {
    // Inhalt automatisch unter Statusleiste/Notch einrücken, Hintergrund passend zur App
    contentInset: 'automatic',
    backgroundColor: '#f6f7f9',
    scheme: 'DiabetesGuard',
  },
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
