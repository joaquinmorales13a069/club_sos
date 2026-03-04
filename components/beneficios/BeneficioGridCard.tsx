import React from "react";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import type { BeneficioData, TipoBeneficio } from "../../type";

export interface Beneficio extends BeneficioData {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
    imagen_url?: string | null;
}

interface BeneficioGridCardProps {
    beneficio: Beneficio;
    onPress: () => void;
}

const BENEFICIO_LABELS: Record<TipoBeneficio, string> = {
    anuncio: "Anuncio",
    descuento: "Descuento",
    promocion: "Promoción",
};

export default function BeneficioGridCard({
    beneficio,
    onPress,
}: BeneficioGridCardProps) {
    const tipo = beneficio.tipo_beneficio ?? "anuncio";
    const label = BENEFICIO_LABELS[tipo];

    const effectiveImageUrl =
        beneficio.imagen_url ?? beneficio.beneficio_image_url ?? null;

    const imageSource = effectiveImageUrl
        ? { uri: effectiveImageUrl }
        : null;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={beneficio.titulo}
            className="min-w-[280px] max-w-[320px] rounded-xl overflow-hidden bg-sos-white border border-gray-100 shadow-sm dark:bg-[#151f2b] dark:border-gray-800"
        >
            {imageSource ? (
                <ImageBackground
                    source={imageSource}
                    resizeMode="cover"
                    style={{ width: "100%", aspectRatio: 1 }}
                >
                    <View className="absolute top-3 right-3 px-2 py-1 rounded-full bg-sos-red">
                        <Text className="text-sm uppercase text-sos-white font-poppins-bold">
                            {label}
                        </Text>
                    </View>
                </ImageBackground>
            ) : (
                <View
                    style={{ width: "100%", aspectRatio: 1 }}
                    className="justify-center items-center bg-gray-100 dark:bg-gray-800"
                >
                    <View className="absolute top-3 right-3 px-2 py-1 rounded-full bg-sos-red">
                        <Text className="text-sm uppercase text-sos-white font-poppins-bold">
                            {label}
                        </Text>
                    </View>
                    <Image
                        source={require("../../assets/images/ICON-404.webp")}
                        resizeMode="contain"
                        style={{ width: "10%", height: "10%" }}
                    />
                </View>
            )}

            <View className="p-4">
                <Text
                    className="text-base font-poppins-bold text-sos-bluegreen dark:text-sos-white"
                    numberOfLines={1}
                >
                    {beneficio.titulo}
                </Text>
                <Text
                    className="mt-1 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium"
                    numberOfLines={2}
                >
                    {beneficio.descripcion}
                </Text>
            </View>
        </Pressable>
    );
}

