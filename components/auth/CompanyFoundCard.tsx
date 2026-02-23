import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

// Brand colour constant for inline icon props (React Native limitation)
const SOS_BLUEGREEN = "#0066CC";
const GREEN_VERIFIED = "#16a34a";

interface CompanyFoundCardProps {
  /** Company display name */
  nombreEmpresa: string;
  /** Company status label (e.g. "Verificada", "Activa") */
  estado: string;
  /** Single character shown in the avatar circle. Defaults to first letter of nombreEmpresa */
  logoLetter?: string;
  /** When true a green verified badge is rendered next to the estado label */
  isVerified?: boolean;
}

/**
 * Presentational card that displays company information after a successful
 * código-de-empresa lookup.  Contains NO business logic or queries.
 */
export default function CompanyFoundCard({
  nombreEmpresa,
  estado,
  logoLetter,
  isVerified = false,
}: CompanyFoundCardProps) {
  const firstLetter = logoLetter || nombreEmpresa.charAt(0).toUpperCase();

  return (
    <View className="mt-6 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 flex-row items-center gap-4">
      {/* Avatar / Logo placeholder */}
      <View className="w-14 h-14 rounded-full items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 overflow-hidden bg-blue-100 dark:bg-blue-900">
        <Text className="font-poppins-bold text-xl text-sos-bluegreen">
          {firstLetter}
        </Text>
      </View>

      {/* Company info */}
      <View className="flex-1">
        <Text className="text-xs font-poppins-semibold text-sos-bluegreen uppercase tracking-widest mb-0.5">
          Empresa encontrada
        </Text>
        <Text className="text-lg font-poppins-bold leading-tight text-gray-900 dark:text-sos-white">
          {nombreEmpresa}
        </Text>
        <View className="flex-row items-center gap-1 mt-1">
          {isVerified && (
            <MaterialIcons name="verified" size={16} color={GREEN_VERIFIED} />
          )}
          <Text className="text-sm font-sans text-sos-gray dark:text-gray-400">
            {estado}
          </Text>
        </View>
      </View>

      {/* Trailing check icon */}
      <MaterialIcons name="check-circle" size={24} color={SOS_BLUEGREEN} />
    </View>
  );
}
