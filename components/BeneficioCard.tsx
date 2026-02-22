import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { THEME_COLORS } from "@/libs/themeColors";
import type { BeneficioData, TipoBeneficio } from "../type";

const SOS_BLUEGREEN = THEME_COLORS.sosBluegreen;
const SOS_RED = THEME_COLORS.sosRed;
const SOS_GRAY = THEME_COLORS.sosGray;

// Extend BeneficioData to include Appwrite document metadata
export interface Beneficio extends BeneficioData {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
}

interface BeneficioCardProps {
  beneficio: Beneficio;
}

const BENEFICIO_STYLE: Record<
  TipoBeneficio,
  {
    badgeClass: string;
    badgeTextClass: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    iconWrapClass: string;
    iconColor: string;
    label: string;
  }
> = {
  descuento: {
    badgeClass: "bg-green-100",
    badgeTextClass: "text-green-700",
    iconName: "percent",
    iconWrapClass: "bg-green-100",
    iconColor: SOS_BLUEGREEN,
    label: "Descuento",
  },
  promocion: {
    badgeClass: "bg-amber-100",
    badgeTextClass: "text-amber-700",
    iconName: "local-offer",
    iconWrapClass: "bg-amber-100",
    iconColor: SOS_RED,
    label: "Promocion",
  },
  anuncio: {
    badgeClass: "bg-sky-100",
    badgeTextClass: "text-sky-700",
    iconName: "campaign",
    iconWrapClass: "bg-sky-100",
    iconColor: SOS_GRAY,
    label: "Anuncio",
  },
};

export default function BeneficioCard({ beneficio }: BeneficioCardProps) {
  // Default to "anuncio" if tipo_beneficio is not set
  const tipoBeneficio = beneficio.tipo_beneficio ?? "anuncio";
  const config = BENEFICIO_STYLE[tipoBeneficio];

  return (
    <View className="p-4 border border-gray-100 shadow-sm rounded-2xl bg-sos-white">
      <View className="flex-row items-start gap-3">
        <View className={`h-11 w-11 items-center justify-center rounded-full ${config.iconWrapClass}`}>
          <MaterialIcons name={config.iconName} size={20} color={config.iconColor} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-base text-gray-900 font-poppins-semibold" numberOfLines={1}>
              {beneficio.titulo}
            </Text>
            <View className={`rounded-md px-2 py-1 ${config.badgeClass}`}>
              <Text className={`text-xs font-poppins-semibold ${config.badgeTextClass}`}>
                {config.label}
              </Text>
            </View>
          </View>

          <Text className="mt-1 text-sm text-sos-gray" numberOfLines={2}>
            {beneficio.descripcion}
          </Text>
        </View>
      </View>
    </View>
  );
}
