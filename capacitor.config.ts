import type { CapacitorConfig } from '@capacitor/cli';

// Un seul code, trois cibles : web (prototype), Android et iOS.
// Sur mobile, les regles et l'historique restent locaux ; le relais serveur
// optionnel (moderation, YouTube, recherche) est decrit dans docs/ARCHITECTURE.md.
const config: CapacitorConfig = {
  appId: 'net.oasis.child',
  appName: 'OasisNet',
  webDir: 'dist',
  plugins: {
    // Pas de splash anime, pas de clignotement, pas de son automatique.
    SplashScreen: { launchAutoHide: false, backgroundColor: '#f7f4ee' },
  },
  ios: { contentMode: 'mobile' },
  android: { allowMixedContent: false },
};

export default config;
