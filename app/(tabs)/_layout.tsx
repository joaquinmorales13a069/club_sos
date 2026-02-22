import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { THEME_COLORS } from "@/libs/themeColors";

const SOS_BLUEGREEN = THEME_COLORS.sosBluegreen;
const SOS_WHITE = THEME_COLORS.sosWhite;

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  inicio: "home-filled",
  citas: "event-note",
  beneficios: "redeem",
  documentos: "folder-open",
  perfil: "person-outline",
};

const TAB_LABELS: Record<string, string> = {
  inicio: "Inicio",
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
        tabBarActiveTintColor: SOS_WHITE,
        tabBarInactiveTintColor: "rgba(255,255,255,0.50)",
        tabBarStyle: {
          position: "absolute",
          height: 70,
          marginHorizontal: 16,
          marginBottom: 20,
          borderRadius: 24,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: SOS_BLUEGREEN,
          // iOS shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 14,
          // Android elevation
          elevation: 10,
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
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="citas" />
      <Tabs.Screen name="beneficios" />
      <Tabs.Screen name="documentos" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
