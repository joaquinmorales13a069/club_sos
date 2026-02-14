import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { Text, TextInput } from "react-native";
import "./globals.css";

let typographyDefaultsApplied = false;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (fontsLoaded && !typographyDefaultsApplied) {
    const TextWithDefaults = Text as typeof Text & {
      defaultProps?: { style?: unknown };
    };
    const TextInputWithDefaults = TextInput as typeof TextInput & {
      defaultProps?: { style?: unknown };
    };

    if (!TextWithDefaults.defaultProps) {
      TextWithDefaults.defaultProps = {};
    }
    if (!TextInputWithDefaults.defaultProps) {
      TextInputWithDefaults.defaultProps = {};
    }

    TextWithDefaults.defaultProps.style = [
      { fontFamily: "Poppins_400Regular" },
      TextWithDefaults.defaultProps.style,
    ];
    TextInputWithDefaults.defaultProps.style = [
      { fontFamily: "Poppins_400Regular" },
      TextInputWithDefaults.defaultProps.style,
    ];
    typographyDefaultsApplied = true;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
