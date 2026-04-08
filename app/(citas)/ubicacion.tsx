import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import TopAppBar from "@/components/auth/TopAppBar";
import { THEME_COLORS } from "@/libs/themeColors";

// ─── Data ─────────────────────────────────────────────────────────────────────

const UBICACIONES = [
    {
        id: 1,
        nombre: "Managua",
        descripcion: "Clínicas SOS en la capital",
        icon: "location-city" as const,
    },
    {
        id: 2,
        nombre: "León",
        descripcion: "Clínicas SOS en el occidente",
        icon: "location-city" as const,
    },
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UbicacionScreen() {
    const router = useRouter();

    const handleSeleccionar = (ubicacion: (typeof UBICACIONES)[number]) => {
        router.push({
            pathname: "/(citas)/servicio",
            params: {
                categoriaId: String(ubicacion.id),
                ubicacionNombre: ubicacion.nombre,
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={1}
                totalSteps={7}
            />

            <View className="flex-1 px-4">
                {/* Título */}
                <Text className="pt-2 pb-1 text-3xl tracking-tight leading-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Selecciona la clínica
                </Text>
                <Text className="pb-8 text-base leading-normal text-sos-gray dark:text-gray-400">
                    ¿En qué ubicación deseas tu cita médica?
                </Text>

                {/* Tarjetas de ubicación */}
                <View className="gap-4">
                    {UBICACIONES.map((ubicacion) => (
                        <Pressable
                            key={ubicacion.id}
                            onPress={() => handleSeleccionar(ubicacion)}
                            accessibilityRole="button"
                            accessibilityLabel={`Seleccionar ${ubicacion.nombre}`}
                            className="active:opacity-80"
                        >
                            <View className="flex-row items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] shadow-sm">
                                {/* Icono */}
                                <View className="justify-center items-center w-14 h-14 rounded-xl bg-sos-bluegreen/10">
                                    <MaterialIcons
                                        name={ubicacion.icon}
                                        size={28}
                                        color={THEME_COLORS.sosBluegreen}
                                    />
                                </View>

                                {/* Texto */}
                                <View className="flex-1">
                                    <Text className="text-lg text-gray-900 dark:text-sos-white font-poppins-bold">
                                        {ubicacion.nombre}
                                    </Text>
                                    <Text className="text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                                        {ubicacion.descripcion}
                                    </Text>
                                </View>

                                {/* Flecha */}
                                <MaterialIcons
                                    name="chevron-right"
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </View>
                        </Pressable>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}
