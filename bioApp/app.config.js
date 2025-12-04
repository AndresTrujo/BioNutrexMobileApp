export default {
  name: "bioApp",
  slug: "bioApp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "bioapp",

  newArchEnabled: true,

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.charlie1328.bioApp",
  },

  android: {
    package: "com.charlie1328.bioApp",
    versionCode: 1,

    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },

    permissions: ["INTERNET"],
    usesCleartextTraffic: true,
    enableDangerousExperimentalLeanBuilds: false,
    blockedPermissions: [],
    softwareKeyboardLayoutMode: "resize",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
  },

  web: {
    favicon: "./assets/favicon.png",
  },

  extra: {
    stripePublishableKey:
      process.env.EXPO_PUBLIC_STRIPE_PK ||
      "pk_test_51RVuzfCjeYG66smeXRgEmy1Ox5o0gKHZJbsDrB8qZ6u9HfNCBYgB1s1E95n3aFKx4PVjo5DR3LAnOLsXaFj8nqjZ00Iicd2vqk",

    eas: {
      projectId: "9b32b44a-0fc4-45e5-b615-98fcd62aef14",
    },
  },
};
