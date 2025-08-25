import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.9680b849967b4f9ea4d4b5b8187472ec',
  appName: 'chrono-snap-sync',
  webDir: 'dist',
  server: {
    url: 'https://9680b849-967b-4f9e-a4d4-b5b8187472ec.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;