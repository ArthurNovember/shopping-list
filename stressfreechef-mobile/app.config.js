import "dotenv/config";

export default {
  expo: {
    name: "Nákupní seznam",
    slug: "shopping-list",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
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
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.arthurnovember.shoppinglist",
      versionCode: 1,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      [
        "expo-speech-recognition",
        {
          microphonePermission: "Allow $(PRODUCT_NAME) to use the microphone.",
          speechRecognitionPermission:
            "Allow $(PRODUCT_NAME) to use speech recognition.",
          androidSpeechServicePackages: [
            "com.google.android.googlequicksearchbox",
          ],
        },
      ],
    ],
    extra: {
      apiBase: process.env.EXPO_PUBLIC_API_BASE,
      eas: {
        projectId: "d173f2e2-5c7e-454a-bf84-edc2dd78462a",
      },
    },
  },
};
