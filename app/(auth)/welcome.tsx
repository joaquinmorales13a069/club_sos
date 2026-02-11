import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HERO_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDzqPypHKvouCo50B9GM0oKcMqmQjUsf4owQqlC3P1KgnzgDLLLu7D2da1JdqbxLncXSOGYo1IyUVzHnEwUEFZ3zrb4w0H-HUJ_LhUNq5eQ4iS2v9hGnX1flAySVASqp_23SS3OjMsjF4cTq0mCUSqErzJAkj0iKZsNwcCkBTY2_aAvf_I6kIsPD7wQWOak3Mw8tBSdPVzWtE3oFC-PBgeQqx8AI1eGigmZfsxKgo1bHL8JftI3m-6a9mC3mVuW-7czGJ657vssHWFM';

const COLORS = {
  red: "#CC3333",
  gray: "#666666",
  white: "#FFFFFF",
  bluegreen: "#0066CC",
} as const;
const LOGIN_ROUTE = "/(auth)/login-phone" as Href;

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const [supportOpen, setSupportOpen] = useState(false);

  const gradientColors = useMemo(() => {
    // Match: "bg-gradient-to-t from-black/60 to-transparent"
    // In dark mode, slightly stronger bottom to keep contrast.
    const from =
      scheme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.60)";
    return [from, "rgba(0,0,0,0.0)"] as const;
  }, [scheme]);

  return (
    <SafeAreaView className="flex-1 bg-sos-white">
      <View className="flex-1">
        {/* Header: Logo */}
        <View className="justify-center items-center pt-10 pb-6">
          <Text
            accessibilityLabel="Logo de ClubSOS"
            className="text-3xl tracking-tight text-sos-bluegreen font-poppins-bold"
          >
            ClubSOS
          </Text>
        </View>

        {/* Main Content: Hero */}
        <View className="px-4">
          <View className="mx-auto w-full max-w-[480px]">
            <View className="overflow-hidden mt-2 mb-4 rounded-xl shadow-sm bg-sos-white">
              <ImageBackground
                source={{ uri: HERO_IMAGE_URI }}
                className="h-[360px] w-full bg-sos-white"
                imageStyle={{ resizeMode: "cover" }}
                accessibilityLabel="Familia feliz disfrutando un estilo de vida saludable al aire libre"
                accessible
              >
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                  className="flex-1"
                />
              </ImageBackground>
            </View>
          </View>
        </View>

        {/* Bottom Action Area */}
        <View className="items-center pt-2">
          <View className="mx-auto w-full max-w-[480px]">
            <Text className="px-6 pb-6 text-center text-[28px] leading-tight tracking-tight text-sos-bluegreen font-poppins-bold">
              Tu club de salud {"\n"}y beneficios
            </Text>
          </View>
        </View>

        {/* Actions at screen bottom */}
        <View className="items-center pb-6 mt-auto">
          <View className="mx-auto w-full max-w-[480px]">
            <View className="px-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continuar"
                onPress={() => router.push(LOGIN_ROUTE)}
                className="overflow-hidden justify-center items-center w-full h-14 rounded-xl bg-sos-bluegreen"
              >
                <View className="flex-row gap-2 items-center">
                  <Text className="text-lg leading-normal tracking-[0.015em] text-sos-white font-poppins-bold">
                    Continuar
                  </Text>
                </View>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Soporte / Ayuda"
              onPress={() => setSupportOpen(true)}
              className="flex-row gap-2 justify-center items-center px-4 py-2 mt-2 rounded-lg"
            >
              <MaterialIcons
                name="help-outline"
                size={18}
                color={COLORS.gray}
              />
              <Text className="text-sm leading-normal underline text-sos-gray font-poppins-medium">
                Soporte / Ayuda
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Support / Help modal (simple + listo) */}
      <Modal
        animationType="fade"
        transparent
        visible={supportOpen}
        onRequestClose={() => setSupportOpen(false)}
      >
        <View className="flex-1 justify-center items-center px-6 bg-black/50">
          <View className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-sos-white">
            <View className="px-5 pt-5 pb-4">
              <Text className="text-lg text-sos-bluegreen font-poppins-bold">
                Soporte / Ayuda
              </Text>
              <Text className="mt-2 text-sm leading-5 text-sos-gray">
                Si necesitas ayuda, contáctanos desde la sección de soporte o
                revisa las preguntas frecuentes.
              </Text>
            </View>
            <View className="flex-row gap-2 justify-end px-5 pb-5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar soporte"
                onPress={() => setSupportOpen(false)}
                className="justify-center items-center px-4 h-11 rounded-xl bg-sos-bluegreen"
              >
                <Text className="text-sm text-sos-white font-poppins-semibold">
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

