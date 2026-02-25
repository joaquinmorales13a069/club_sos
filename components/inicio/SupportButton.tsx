import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { THEME_COLORS } from "@/libs/themeColors";

const SOS_BLUEGREEN = THEME_COLORS.sosBluegreen;

interface SupportButtonProps {
  onPress: () => void;
}

export default function SupportButton({ onPress }: SupportButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ayuda por WhatsApp"
      onPress={onPress}
      className="self-start rounded-lg border border-gray-200 px-3 py-2 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-2">
        <FontAwesome name="whatsapp" size={17} color={SOS_BLUEGREEN} />
        <Text className="text-sm text-sos-bluegreen font-poppins-medium">
          ¿Necesitas ayuda? WhatsApp
        </Text>
      </View>
    </Pressable>
  );
}
