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

const PRIMARY_HEX = "#136dec";
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
    <SafeAreaView className="flex-1 bg-[#f6f7f8] dark:bg-[#101822]">
      <View className="flex-1">
        {/* Header: Logo */}
        <View className="justify-center items-center pt-10 pb-6">
          <View className="flex-row gap-2 items-center">
            <View
              className="justify-center items-center w-12 h-12 rounded-xl"
              style={{ backgroundColor: PRIMARY_HEX }}
              accessibilityLabel="Logo de ClubSOS"
              accessible
            >
              <MaterialIcons name="medical-services" size={28} color="#fff" />
            </View>
            <Text className="text-2xl font-extrabold tracking-tight text-[#111418] dark:text-white">
              ClubSOS
            </Text>
          </View>
        </View>

        {/* Main Content: Hero */}
        <View className="px-4">
          <View className="mx-auto w-full max-w-[480px]">
            <View className="overflow-hidden mt-2 mb-4 bg-white rounded-xl shadow-sm dark:bg-gray-800">
              <ImageBackground
                source={{ uri: HERO_IMAGE_URI }}
                className="h-[360px] w-full bg-white dark:bg-gray-800"
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
            <Text className="px-6 pb-6 text-center text-[28px] font-bold leading-tight tracking-tight text-[#111418] dark:text-white">
              Tu club de salud {"\n"}y beneficios
            </Text>

            <View className="px-4 py-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continuar"
                onPress={() => router.push(LOGIN_ROUTE)}
                className="overflow-hidden justify-center items-center w-full h-14 rounded-xl"
                style={{ backgroundColor: PRIMARY_HEX }}
              >
                <Text className="text-lg font-bold leading-normal tracking-[0.015em] text-white">
                  Continuar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Support at screen bottom */}
        <View className="mt-auto items-center pb-8">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Soporte / Ayuda"
            onPress={() => setSupportOpen(true)}
            className="flex-row gap-2 justify-center items-center px-4 py-2 rounded-lg"
          >
            <MaterialIcons
              name="help-outline"
              size={18}
              color={scheme === "dark" ? "#9ca3af" : "#617289"}
            />
            <Text className="text-sm font-medium leading-normal text-[#617289] underline dark:text-gray-400">
              Soporte / Ayuda
            </Text>
          </Pressable>
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
          <View className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white dark:bg-[#101822]">
            <View className="px-5 pt-5 pb-4">
              <Text className="text-lg font-bold text-[#111418] dark:text-white">
                Soporte / Ayuda
              </Text>
              <Text className="mt-2 text-sm leading-5 text-[#617289] dark:text-gray-300">
                Si necesitas ayuda, contáctanos desde la sección de soporte o
                revisa las preguntas frecuentes.
              </Text>
            </View>
            <View className="flex-row gap-2 justify-end px-5 pb-5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar soporte"
                onPress={() => setSupportOpen(false)}
                className="justify-center items-center px-4 h-11 bg-gray-100 rounded-xl dark:bg-gray-800"
              >
                <Text className="text-sm font-semibold text-[#111418] dark:text-white">
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

