import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import CitaCard from "@/components/citas/CitaCard";
import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";
import {
    getCurrentUser,
    findMiembroByAuthUserId,
    getCitasByMiembro,
    getServiciosByEaIds,
    getDoctoresByEaIds,
    deleteCita,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";
import type { Cita, Servicio, Doctor } from "../../type";

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceMap = Map<number, string>;
type DoctorMap = Map<number, string>;
type ServiceDataMap = Map<number, Servicio>;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CitasTabScreen() {
    const router = useRouter();

    const [citas, setCitas] = useState<Cita[]>([]);
    const [serviceMap, setServiceMap] = useState<ServiceMap>(new Map());
    const [serviceDataMap, setServiceDataMap] = useState<ServiceDataMap>(new Map());
    const [doctorMap, setDoctorMap] = useState<DoctorMap>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const loadCitas = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) throw new Error("Usuario no autenticado");

            const miembroDoc = await findMiembroByAuthUserId(currentUser.$id);
            if (!miembroDoc) {
                setCitas([]);
                return;
            }

            const citasData = await getCitasByMiembro(miembroDoc.$id);

            if (citasData.length > 0) {
                const serviceEaIds = [
                    ...new Set(
                        citasData
                            .map((c) => parseInt(c.ea_service_id))
                            .filter((n) => !isNaN(n)),
                    ),
                ];
                const providerEaIds = [
                    ...new Set(
                        citasData
                            .map((c) => parseInt(c.ea_provider_id))
                            .filter((n) => !isNaN(n)),
                    ),
                ];

                const [services, doctors] = await Promise.all([
                    getServiciosByEaIds(serviceEaIds),
                    getDoctoresByEaIds(providerEaIds),
                ]);

                const serviciosList = services as Servicio[];
                setServiceMap(
                    new Map(serviciosList.map((s) => [s.ea_id, s.nombre])),
                );
                setServiceDataMap(
                    new Map(serviciosList.map((s) => [s.ea_id, s])),
                );
                setDoctorMap(
                    new Map(
                        (doctors as Doctor[]).map((d) => [
                            d.ea_id,
                            `${d.nombres} ${d.apellidos}`,
                        ]),
                    ),
                );
            }

            setCitas(citasData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar las citas",
            );
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (hasLoadedOnce) {
                loadCitas(false);
            } else {
                loadCitas(true);
            }
        }, [loadCitas, hasLoadedOnce]),
    );

    const handleAgendar = () => {
        router.push("/(citas)/ubicacion");
    };

    const handleDelete = (citaId: string) => {
        Alert.alert(
            "Eliminar cita",
            "¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCita(citaId);
                            await loadCitas(false);
                        } catch {
                            Alert.alert("Error", "No se pudo eliminar la cita. Intenta de nuevo.");
                        }
                    },
                },
            ],
        );
    };

    const handleEdit = (cita: Cita) => {
        const servicio = serviceDataMap.get(parseInt(cita.ea_service_id));
        if (!servicio) return;

        const ubicacionNombre = servicio.ea_category_id === 1 ? "Managua" : "León";

        router.push({
            pathname: "/(citas)/fecha",
            params: {
                categoriaId: String(servicio.ea_category_id),
                ubicacionNombre,
                eaServiceId: cita.ea_service_id,
                servicioNombre: servicio.nombre,
                servicioDuracion: String(servicio.duracion),
                eaProviderId: cita.ea_provider_id,
                doctorNombre: doctorMap.get(parseInt(cita.ea_provider_id)) ?? "",
                citaIdToEdit: cita.$id,
            },
        });
    };

    // ─── Loading ─────────────────────────────────────────────
    if (loading) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator
                        size="large"
                        color={THEME_COLORS.sosBluegreen}
                    />
                    <Text className="mt-4 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        Cargando citas...
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    // ─── Error ───────────────────────────────────────────────
    if (error) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                    <Pressable
                        onPress={() => loadCitas(true)}
                        className="px-6 py-3 mt-4 rounded-xl bg-sos-bluegreen"
                    >
                        <Text className="text-sm text-sos-white font-poppins-semibold">
                            Reintentar
                        </Text>
                    </Pressable>
                </View>
            </TabScreenView>
        );
    }

    // ─── Render ──────────────────────────────────────────────
    return (
        <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TabScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="pt-6">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl text-sos-bluegreen dark:text-sos-white font-poppins-bold">
                            Mis Citas
                        </Text>
                        <Pressable
                            onPress={handleAgendar}
                            accessibilityRole="button"
                            accessibilityLabel="Agendar cita"
                            className="flex-row gap-1 items-center px-3 py-2 rounded-xl bg-sos-bluegreen"
                        >
                            <MaterialIcons
                                name="add"
                                size={18}
                                color="#FFFFFF"
                            />
                            <Text className="text-sm text-sos-white font-poppins-semibold">
                                Agendar
                            </Text>
                        </Pressable>
                    </View>

                    {/* Lista o estado vacío */}
                    {citas.length === 0 ? (
                        <View className="items-center px-4 py-12 bg-gray-50 dark:bg-[#151f2b] rounded-2xl">
                            <MaterialIcons
                                name="event-busy"
                                size={48}
                                color="#9CA3AF"
                            />
                            <Text className="mt-4 text-base text-center text-gray-500 dark:text-gray-400 font-poppins-semibold">
                                Sin citas programadas
                            </Text>
                            <Text className="mt-1 text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                                Presiona &quot;Agendar&quot; para reservar tu primera cita médica.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {citas.map((cita) => (
                                <CitaCard
                                    key={cita.$id}
                                    cita={cita}
                                    servicio={
                                        serviceMap.get(
                                            parseInt(cita.ea_service_id),
                                        ) ?? "Servicio no disponible"
                                    }
                                    doctor={
                                        doctorMap.get(
                                            parseInt(cita.ea_provider_id),
                                        ) ?? "Doctor no disponible"
                                    }
                                    onEdit={() => handleEdit(cita)}
                                    onDelete={() => handleDelete(cita.$id)}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </TabScrollView>
        </TabScreenView>
    );
}
