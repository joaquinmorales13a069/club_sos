import { type Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SOSButton from "@/components/shared/SOSButton";

const LOGIN_ROUTE = "/(auth)/login-phone" as Href;

export default function WelcomeScreen() {
  const router = useRouter();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-sos-white">
      <View className="flex-1">
        {/* Header: Logo */}
        <View className="items-center justify-center pt-6 pb-4">
          <Image
            source={require("../../assets/images/Logo-ClubSOS.webp")}
            accessibilityLabel="Logo de ClubSOS Medical"
            resizeMode="contain"
            className="h-28 w-80"
          />
        </View>

        {/* Main Content: Hero with title overlay */}
        <View className="flex-1 px-4">
          <View className="flex-1 mx-auto w-full max-w-[480px]">
            <View className="flex-1 overflow-hidden shadow-sm rounded-xl bg-sos-white">
              <ImageBackground
                source={require("../../assets/images/Bienvenida-imagen.webp")}
                className="flex-1 w-full bg-sos-white"
                imageStyle={{ resizeMode: "cover" }}
                accessibilityLabel="Médico dando la mano a un paciente"
                accessible
              >
              </ImageBackground>
            </View>
          </View>
        </View>

        {/* Actions at screen bottom */}
        <View className="items-center pt-4 pb-6">
          <View className="mx-auto w-full max-w-[480px]">
            <View className="px-4">
              <SOSButton
                label="Continuar"
                onPress={() => router.push(LOGIN_ROUTE)}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Soporte / Ayuda"
              onPress={() => setSupportOpen(true)}
              className="flex-row items-center justify-center gap-2 px-4 py-2 mt-2 rounded-lg"
            >
              <Image
                source={require("../../assets/images/ICON-soporte.webp")}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-sm leading-normal text-sos-gray font-poppins-medium">
                Soporte / Ayuda
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Support / Help modal */}
      <Modal
        animationType="fade"
        transparent
        visible={supportOpen}
        onRequestClose={() => setSupportOpen(false)}
      >
        <View className="items-center justify-center flex-1 px-6 bg-black/50">
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
            <View className="flex-row justify-end gap-2 px-5 pb-5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar soporte"
                onPress={() => setSupportOpen(false)}
                className="items-center justify-center px-4 h-11 rounded-xl bg-sos-bluegreen"
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
