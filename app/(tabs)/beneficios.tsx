import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View, Pressable, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";
import SOSButton from "@/components/shared/SOSButton";
import BeneficioGridCard, {
    type Beneficio as BeneficioTipo,
} from "@/components/beneficios/BeneficioGridCard";
import BeneficioDetailModal from "@/components/beneficios/BeneficioDetailModal";
import ClinicLocationCard from "@/components/beneficios/ClinicLocationCard";

import {
    getBeneficiosByEmpresa,
    getCurrentUser,
    findMiembroByAuthUserId,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";

export default function BeneficiosTabScreen() {
    const [beneficios, setBeneficios] = useState<BeneficioTipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [selectedBeneficio, setSelectedBeneficio] =
        useState<BeneficioTipo | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    const loadBeneficios = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) {
                throw new Error("Usuario no autenticado");
            }

            const miembroDoc = await findMiembroByAuthUserId(currentUser.$id);
            if (!miembroDoc || !miembroDoc.empresa_id) {
                setBeneficios([]);
                return;
            }

            const beneficiosDocs = await getBeneficiosByEmpresa(
                miembroDoc.empresa_id,
            );

            const beneficiosNormalizados: BeneficioTipo[] = beneficiosDocs.map(
                (doc: any) => ({
                    ...(doc as BeneficioTipo),
                    imagen_url:
                        doc.imagen_url ??
                        doc.beneficio_image_url ??
                        null,
                }),
            );

            setBeneficios(beneficiosNormalizados);
        } catch (err) {
            console.error("Error al cargar beneficios:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar los beneficios",
            );
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (hasLoadedOnce) {
                loadBeneficios(false);
            } else {
                loadBeneficios(true);
            }
        }, [loadBeneficios, hasLoadedOnce]),
    );

    const handleOpenBeneficio = (beneficio: BeneficioTipo) => {
        setSelectedBeneficio(beneficio);
        setDetailVisible(true);
    };

    const handleCloseBeneficio = () => {
        setDetailVisible(false);
        setSelectedBeneficio(null);
    };

    const beneficioColumns = useMemo(() => {
        const cols: BeneficioTipo[][] = [];
        const ITEMS_PER_COLUMN = 1;
        for (let i = 0; i < beneficios.length; i += ITEMS_PER_COLUMN) {
            cols.push(beneficios.slice(i, i + ITEMS_PER_COLUMN));
        }
        return cols;
    }, [beneficios]);

    const handleOpenWhatsAppQuote = () => {
        Alert.alert("Farmacia", "Abrir flujo de cotización por WhatsApp");
        // Cuando tengan el número oficial de WhatsApp se puede usar:
        // Linking.openURL(`https://wa.me/XXXXXXXXXXX?text=${encodeURIComponent("Hola, quiero cotizar mis medicamentos")}`);
    };

    const handleOpenWhatsAppSupport = () => {
        Alert.alert("Soporte", "Abrir soporte por WhatsApp");
    };

    if (loading) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator
                        size="large"
                        color={THEME_COLORS.sosBluegreen}
                    />
                    <Text className="mt-4 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        Cargando beneficios...
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    if (error) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="flex-1 justify-center items-center px-4">
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
                contentContainerStyle={{ paddingHorizontal: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Sección: Tus Beneficios */}
                <View className="pt-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-2xl text-sos-bluegreen dark:text-sos-white font-poppins-bold">
                            Tus Beneficios en SOS Medical
                        </Text>
                    </View>

                    {beneficios.length === 0 ? (
                        <View className="px-4 py-8 rounded-2xl bg-gray-50 dark:bg-[#151f2b]">
                            <Text className="text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                                No tienes beneficios activos en este momento.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: 8,
                            }}
                        >
                            {beneficioColumns.map((col, colIndex) => (
                                <View
                                    key={colIndex}
                                    style={{
                                        marginRight:
                                            colIndex ===
                                            beneficioColumns.length - 1
                                                ? 0
                                                : 12,
                                    }}
                                >
                                    {col.map((beneficio) => (
                                        <View
                                            key={beneficio.$id}
                                            className="mb-4"
                                        >
                                            <BeneficioGridCard
                                                beneficio={beneficio}
                                                onPress={() =>
                                                    handleOpenBeneficio(
                                                        beneficio,
                                                    )
                                                }
                                            />
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Sección: Farmacia */}
                <View className="mt-8">
                    <Text className="mb-4 text-2xl text-sos-bluegreen dark:text-sos-white font-poppins-bold">
                        Farmacia
                    </Text>

                    <View className="flex-row items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-sos-white shadow-sm dark:border-gray-800 dark:bg-[#151f2b]">
                        <View className="justify-center items-center w-14 h-14 rounded-full bg-sos-bluegreen/10">
                            <FontAwesome
                                name="medkit"
                                size={26}
                                color={THEME_COLORS.sosBluegreen}
                            />
                        </View>

                        <View className="flex-1">
                            <Text className="text-base text-gray-900 dark:text-sos-white font-poppins-bold">
                                Cotiza tus medicamentos
                            </Text>
                            <Text className="mt-1 text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                                Recibe tu presupuesto al instante.
                            </Text>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Cotizar medicamentos por WhatsApp"
                            onPress={handleOpenWhatsAppQuote}
                            className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]"
                        >
                            <FontAwesome name="whatsapp" size={16} color="#fff" />
                            <Text className="text-sm text-sos-white font-poppins-semibold">
                                Cotizar
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Sección: Ubicaciones */}
                <View className="mt-8">
                    <Text className="mb-4 text-2xl text-sos-bluegreen dark:text-sos-white font-poppins-bold">
                        Ubicaciones
                    </Text>

                    <View className="gap-4">
                        <ClinicLocationCard
                            name="Clínica Managua"
                            address="Bolonia, de Sermesa 80 vrs Oeste."
                            latitude={12.140166566789631}
                            longitude={-86.28505388650834}
                        />

                        <ClinicLocationCard
                            name="Clínica León"
                            address="Frente a los Bomberos Voluntarios, HEODRA León"
                            latitude={12.433016335689745}
                            longitude={-86.87841874232778}
                        />
                    </View>
                </View>

                {/* Sección: Soporte */}
                <View className="mt-8 mb-6">
                    <View className="items-center px-5 py-6 rounded-2xl bg-sos-bluegreen">
                        <Text className="mb-2 text-lg text-sos-white font-poppins-bold">
                            ¿Necesitas ayuda?
                        </Text>
                        <Text className="mb-5 text-sm text-center text-sos-white/80 font-poppins-medium">
                            Nuestro equipo de soporte está disponible 24/7 para atenderte.
                        </Text>
                        <SOSButton
                            label="Escríbenos por WhatsApp"
                            onPress={handleOpenWhatsAppSupport}
                            accessibilityLabel="Abrir soporte por WhatsApp"
                        />
                    </View>
                </View>

                <BeneficioDetailModal
                    visible={detailVisible}
                    beneficio={selectedBeneficio}
                    onClose={handleCloseBeneficio}
                />
            </TabScrollView>
        </TabScreenView>
    );
}
