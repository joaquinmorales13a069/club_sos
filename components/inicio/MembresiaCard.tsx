import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { THEME_COLORS } from "@/libs/themeColors";

const SOS_WHITE = THEME_COLORS.sosWhite;

interface MembresiaCardProps {
  estadoAfiliacion: string;
  mensaje: string;
  empresaNombre: string;
  afiliadoNombre: string;
}

export default function MembresiaCard({
  estadoAfiliacion,
  mensaje,
  empresaNombre,
  afiliadoNombre,
}: MembresiaCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl border border-sos-bluegreen bg-sos-bluegreen shadow-sm">
      <View className="p-5">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-sos-white/20">
            <MaterialIcons name="verified-user" size={22} color={SOS_WHITE} />
          </View>

          <View className="flex-1">
            <Text className="text-xs uppercase tracking-widest text-sos-white/80 font-poppins-semibold">
              Estado de la afiliación
            </Text>
            <Text className="mt-1 text-lg text-sos-white font-poppins-bold">
              {estadoAfiliacion}
            </Text>
            <Text className="mt-1 text-sm text-sos-white/90">{mensaje}</Text>
          </View>
        </View>

        <View className="mt-4 rounded-xl bg-sos-white/15 p-4">
          <View className="mb-2">
            <Text className="text-xs uppercase tracking-wide text-sos-white/80">
              Empresa
            </Text>
            <Text className="mt-0.5 text-base text-sos-white font-poppins-semibold">
              {empresaNombre}
            </Text>
          </View>

          <View>
            <Text className="text-xs uppercase tracking-wide text-sos-white/80">
              Afiliado
            </Text>
            <Text className="mt-0.5 text-base text-sos-white font-poppins-semibold">
              {afiliadoNombre}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
