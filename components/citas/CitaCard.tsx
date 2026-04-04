import React, { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { Cita } from "@/type";

// ─── Estado config ────────────────────────────────────────────────────────────

type EstadoConfig = {
    bgColor: string;
    borderColor: string;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
};

const ESTADO_CONFIG: Record<Cita["estado_sync"], EstadoConfig> = {
    sincronizado: {
        bgColor: "#CC3333",
        borderColor: "#CC3333",
        label: "Confirmada",
        icon: "check-circle",
    },
    pendiente: {
        bgColor: "#D97706",
        borderColor: "#D97706",
        label: "Pendiente de aprobación",
        icon: "schedule",
    },
    fallido: {
        bgColor: "#9CA3AF",
        borderColor: "#9CA3AF",
        label: "Rechazada",
        icon: "cancel",
    },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CitaCardProps {
    cita: Cita;
    servicio: string;
    doctor: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CitaCard({ cita, servicio, doctor }: CitaCardProps) {
    const fechaFormateada = useMemo(() => {
        const date = new Date(cita.fecha_hora_cita);
        const weekday = new Intl.DateTimeFormat("es-NI", {
            weekday: "long",
            timeZone: "UTC",
        }).format(date);
        const day = new Intl.DateTimeFormat("es-NI", {
            day: "2-digit",
            timeZone: "UTC",
        }).format(date);
        const month = new Intl.DateTimeFormat("es-NI", {
            month: "long",
            timeZone: "UTC",
        }).format(date);
        const time = new Intl.DateTimeFormat("es-NI", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
        }).format(date);

        const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        const monthCap = month.charAt(0).toUpperCase() + month.slice(1);

        return `${weekdayCap}, ${day} de ${monthCap} a las ${time}`;
    }, [cita.fecha_hora_cita]);

    const config = ESTADO_CONFIG[cita.estado_sync] ?? ESTADO_CONFIG.pendiente;

    return (
        <View
            style={{
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
            }}
            className="overflow-hidden rounded-2xl border shadow-sm"
        >
            <View className="p-5">
                {/* Estado badge */}
                <View className="flex-row items-center gap-2">
                    <MaterialIcons name={config.icon} size={16} color="rgba(255,255,255,0.9)" />
                    <Text className="text-xs uppercase tracking-widest text-sos-white/80 font-poppins-semibold">
                        {config.label}
                    </Text>
                </View>

                {/* Fecha */}
                <Text className="mt-2 text-lg text-sos-white font-poppins-bold">
                    {fechaFormateada}
                </Text>

                {/* Detalle */}
                <View className="mt-4 rounded-xl bg-sos-white/15 p-4 gap-2">
                    <View className="flex-row items-center gap-2">
                        <MaterialIcons name="medical-services" size={16} color="rgba(255,255,255,0.85)" />
                        <Text className="flex-1 text-sm text-sos-white/90">
                            Servicio:{" "}
                            <Text className="text-sos-white font-poppins-medium">
                                {servicio}
                            </Text>
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <MaterialIcons name="person-outline" size={16} color="rgba(255,255,255,0.85)" />
                        <Text className="flex-1 text-sm text-sos-white/90">
                            Doctor:{" "}
                            <Text className="text-sos-white font-poppins-medium">
                                {doctor}
                            </Text>
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <MaterialIcons name="person-pin" size={16} color="rgba(255,255,255,0.85)" />
                        <Text className="flex-1 text-sm text-sos-white/90">
                            Paciente:{" "}
                            <Text className="text-sos-white font-poppins-medium">
                                {cita.paciente_nombre}
                            </Text>
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
