import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { THEME_COLORS } from "@/libs/themeColors";

const SOS_BLUEGREEN = THEME_COLORS.sosBluegreen;
const SOS_GRAY = THEME_COLORS.sosGray;
const SOS_WHITE = THEME_COLORS.sosWhite;

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: "home-filled",
  citas: "event-note",
  beneficios: "redeem",
  documentos: "folder-open",
  perfil: "person-outline",
};

const TAB_LABELS: Record<string, string> = {
  index: "Inicio",
  citas: "Citas",
  beneficios: "Beneficios",
  documentos: "Documentos",
  perfil: "Perfil",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: SOS_BLUEGREEN,
        tabBarInactiveTintColor: SOS_GRAY,
        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: SOS_GRAY,
          backgroundColor: SOS_WHITE,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins_500Medium",
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons
            name={TAB_ICONS[route.name] ?? "circle"}
            size={size}
            color={color}
          />
        ),
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="citas" />
      <Tabs.Screen name="beneficios" />
      <Tabs.Screen name="documentos" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
