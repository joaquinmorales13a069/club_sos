import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import type { BeneficioData, TipoBeneficio } from "../../type";

export interface Beneficio extends BeneficioData {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
}

interface BeneficioDetailModalProps {
    visible: boolean;
    beneficio: Beneficio | null;
    onClose: () => void;
}

const BENEFICIO_LABELS: Record<TipoBeneficio, string> = {
    anuncio: "Anuncio",
    descuento: "Descuento",
    promocion: "Promoción",
};

function formatDate(dateString?: string | null) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    try {
        return date.toLocaleDateString("es-NI", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return date.toDateString();
    }
}

export default function BeneficioDetailModal({
    visible,
    beneficio,
    onClose,
}: BeneficioDetailModalProps) {
    if (!beneficio) return null;

    const tipo = beneficio.tipo_beneficio ?? "anuncio";
    const label = BENEFICIO_LABELS[tipo];
    const fechaInicio = formatDate(beneficio.fecha_inicio);
    const fechaFin = formatDate(beneficio.fecha_fin);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/40 justify-end">
                <View className="max-h-[80%] rounded-t-3xl bg-sos-white px-5 pt-4 pb-6 dark:bg-[#151f2b]">
                    <View className="items-center mb-3">
                        <View className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    </View>

                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 pr-4">
                            <Text className="text-lg text-gray-900 dark:text-sos-white font-poppins-bold">
                                {beneficio.titulo}
                            </Text>
                            <View className="mt-2 self-start rounded-full bg-sos-red px-3 py-1">
                                <Text className="text-[11px] text-sos-white font-poppins-semibold uppercase">
                                    {label}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar detalle de beneficio"
                            onPress={onClose}
                            className="px-3 py-1"
                        >
                            <Text className="text-sm text-sos-gray dark:text-gray-300 font-poppins-medium">
                                Cerrar
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 16 }}
                    >
                        <Text className="text-sm leading-6 text-sos-gray dark:text-gray-300 font-poppins-medium">
                            {beneficio.descripcion}
                        </Text>

                        {(fechaInicio || fechaFin) && (
                            <View className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-[#101822]">
                                {fechaInicio && (
                                    <View className="flex-row justify-between mb-1.5">
                                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                                            Desde
                                        </Text>
                                        <Text className="text-xs text-gray-900 dark:text-sos-white font-poppins-semibold">
                                            {fechaInicio}
                                        </Text>
                                    </View>
                                )}
                                {fechaFin && (
                                    <View className="flex-row justify-between mt-1.5">
                                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                                            Hasta
                                        </Text>
                                        <Text className="text-xs text-gray-900 dark:text-sos-white font-poppins-semibold">
                                            {fechaFin}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

