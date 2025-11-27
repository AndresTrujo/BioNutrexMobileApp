export default {
  expo: {
    name: "bioApp",
    slug: "bioApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "bioapp",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.charlie1328.bioApp",
      permissions: ["INTERNET"],
      usesCleartextTraffic: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      stripePublishableKey:
        process.env.EXPO_PUBLIC_STRIPE_PK || "pk_test_51RVuzfCjeYG66smeXRgEmy1Ox5o0gKHZJbsDrB8qZ6u9HfNCBYgB1s1E95n3aFKx4PVjo5DR3LAnOLsXaFj8nqjZ00Iicd2vqk",
      eas: {
        projectId: "9b32b44a-0fc4-45e5-b615-98fcd62aef14",
      },
    },
  },
};
