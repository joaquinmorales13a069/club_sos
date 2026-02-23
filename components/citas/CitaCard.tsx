import React, { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { THEME_COLORS } from "@/libs/themeColors";

const SOS_WHITE = THEME_COLORS.sosWhite;

export interface Cita {
  miembro_id: string;
  empresa_id: string;
  fecha_hora_cita: string;
  motivo_cita: string | null;
  ea_service_id: string | null;
  ea_provider_id: string | null;
  ea_customer_id: string | null;
  estado_sync: string;
  ea_appointment_id: string | null;
}

interface CitaCardProps {
  cita: Cita;
  servicio: string;
  doctor: string;
}

export default function CitaCard({ cita, servicio, doctor }: CitaCardProps) {
  const fechaFormateada = useMemo(() => {
    const date = new Date(cita.fecha_hora_cita);
    return new Intl.DateTimeFormat("es-NI", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }, [cita.fecha_hora_cita]);

  return (
    <View className="overflow-hidden rounded-2xl border border-sos-red bg-sos-red shadow-sm">
      <View className="p-5">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="event" size={18} color={SOS_WHITE} />
          <Text className="text-sm uppercase tracking-widest text-sos-white/80 font-poppins-semibold">
            Proxima cita
          </Text>
        </View>

        <Text className="mt-2 text-lg text-sos-white font-poppins-bold">
          {fechaFormateada}
        </Text>

        <View className="mt-4 rounded-xl bg-sos-white/15 p-4">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="medical-services" size={18} color={SOS_WHITE} />
            <Text className="text-sm text-sos-white/90">
              Servicio:{" "}
              <Text className="text-sos-white font-poppins-medium">{servicio}</Text>
            </Text>
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <MaterialIcons name="person-outline" size={18} color={SOS_WHITE} />
            <Text className="text-sm text-sos-white/90">
              Doctor:{" "}
              <Text className="text-sos-white font-poppins-medium">{doctor}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
