import { useFonts } from "@expo-google-fonts/poppins";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { Text } from "react-native";
import "./globals.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const TextWithDefaults = Text as typeof Text & {
    defaultProps?: { style?: unknown };
  };

  if (!TextWithDefaults.defaultProps) {
    TextWithDefaults.defaultProps = {};
  }

  TextWithDefaults.defaultProps.style = [
    { fontFamily: "Poppins_400Regular" },
    TextWithDefaults.defaultProps.style,
  ];

  return <Stack screenOptions={{ headerShown: false }} />;
}
