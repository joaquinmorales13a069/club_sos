import React, { useEffect, useState, useCallback } from "react";
import {
    Alert,
    Image,
    Text,
    View,
    ActivityIndicator,
    useColorScheme,
} from "react-native";
import { useFocusEffect } from "expo-router";

import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";

import BeneficioCard from "@/components/beneficios/BeneficioCard";
import CitaCard, { type Cita } from "@/components/citas/CitaCard";
import MembresiaCard from "@/components/inicio/MembresiaCard";
import SupportButton from "@/components/inicio/SupportButton";

import {
    getCurrentUser,
    findMiembroByAuthUserId,
    getBeneficiosByEmpresa,
    getEmpresaById,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";

const citaMock: Cita = {
    miembro_id: "miembro-001",
    empresa_id: "empresa-001",
    fecha_hora_cita: new Date().toISOString(),
    motivo_cita: "Control general",
    ea_service_id: null,
    ea_provider_id: null,
    ea_customer_id: null,
    estado_sync: "pendiente",
    ea_appointment_id: null,
};

export default function HomeTabScreen() {
    const [miembro, setMiembro] = useState<any>(null);
    const [empresa, setEmpresa] = useState<any>(null);
    const [beneficios, setBeneficios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const loadUserData = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            setError(null);

            // Get current authenticated user
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                throw new Error("Usuario no autenticado");
            }

            // Get miembro document
            const miembroDoc = await findMiembroByAuthUserId(currentUser.$id);
            if (!miembroDoc) {
                throw new Error("Miembro no encontrado");
            }
            setMiembro(miembroDoc);

            // Get empresa document if empresa_id exists
            if (miembroDoc.empresa_id) {
                const empresaDoc = await getEmpresaById(miembroDoc.empresa_id);
                setEmpresa(empresaDoc);

                // Get beneficios for this empresa
                const beneficiosData = await getBeneficiosByEmpresa(
                    miembroDoc.empresa_id,
                );
                setBeneficios(beneficiosData);
            }
        } catch (err) {
            console.error("Error loading user data:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar los datos",
            );
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    // Recargar datos cuando la pantalla recupera el foco (solo si ya se cargó una vez)
    useFocusEffect(
        useCallback(() => {
            if (hasLoadedOnce) {
                // Recargar en segundo plano sin mostrar spinner
                loadUserData(false);
            } else {
                // Primera carga con spinner
                loadUserData(true);
            }
        }, [loadUserData, hasLoadedOnce]),
    );

    const primerNombre =
        miembro?.nombre_completo?.trim().split(/\s+/)[0] ?? "Usuario";

    if (loading) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="items-center justify-center flex-1">
                    <ActivityIndicator
                        size="large"
                        color={THEME_COLORS.sosBluegreen}
                    />
                    <Text className="mt-4 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        Cargando...
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    if (error) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="items-center justify-center flex-1 px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    return (
        <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TabScrollView
                className="flex-1"
                contentContainerClassName="px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="pt-4 pb-6">
                    <View className="flex-row items-start gap-3">
                        <View className="items-center self-center justify-center rounded-full h-14 w-14">
                            <Image
                                source={require("../../assets/images/USUARIO-ICONO.png")}
                                accessibilityLabel="Icono de usuario ClubSOS"
                                resizeMode="contain"
                                className="h-14 w-14"
                            />
                        </View>

                        <View className="flex-1">
                            <Text className="text-3xl leading-tight text-sos-bluegreen dark:text-sos-white font-poppins-bold">
                                Hola {primerNombre}
                            </Text>
                            <Text className="mt-1 text-sm leading-6 text-sos-gray dark:text-gray-400 font-poppins-semibold">
                                Bienvenido a ClubSOS. ¿En qué te podemos ayudar
                                hoy?
                            </Text>
                        </View>
                    </View>
                </View>

                <MembresiaCard
                    estadoAfiliacion={miembro?.activo ? "Activo" : "Inactivo"}
                    mensaje={
                        miembro?.activo
                            ? "Tu salud está protegida"
                            : "Membresía pendiente de activación"
                    }
                    empresaNombre={empresa?.nombre_empresa ?? "ClubSOS"}
                    afiliadoNombre={miembro?.nombre_completo ?? "Usuario"}
                />

                <View className="mt-7">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xl text-gray-900 dark:text-sos-white font-poppins-bold">
                            Beneficios
                        </Text>
                        <Text className="text-sm text-sos-bluegreen dark:text-sos-bluegreen font-poppins-medium">
                            Ver todos
                        </Text>
                    </View>

                    {beneficios.length === 0 ? (
                        <View className="px-4 py-8 rounded-2xl bg-gray-50 dark:bg-[#151f2b]">
                            <Text className="text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                                No hay beneficios disponibles en este momento
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {beneficios.slice(0, 5).map((beneficio) => (
                                <BeneficioCard
                                    key={beneficio.$id}
                                    beneficio={beneficio}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View className="mt-7">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xl text-gray-900 dark:text-sos-white font-poppins-bold">
                            Mis citas
                        </Text>
                        <Text className="text-sm text-sos-bluegreen dark:text-sos-bluegreen font-poppins-medium">
                            Ver todas
                        </Text>
                    </View>

                    <CitaCard
                        cita={citaMock}
                        servicio="Consulta General"
                        doctor="Dr. Maria Gonzalez"
                    />
                </View>

                <View className="mt-6">
                    <SupportButton
                        onPress={() =>
                            Alert.alert(
                                "WhatsApp",
                                "Abrir soporte por WhatsApp",
                            )
                        }
                    />
                </View>
            </TabScrollView>
        </TabScreenView>
    );
}
