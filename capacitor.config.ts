import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.advents.app",
  appName: "Advents",
  webDir: "dist",
  server: {
    url: "https://b9229b51-6a91-4635-a40a-99b8b2d39ef8.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#1a1a1a",
      showSpinner: false,
      launchAutoHide: true,
      launchShowDuration: 2000,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#1a1a1a",
    },
  },
};

export default config;
