import React from "react";
import { Image, ImageBackground, Text, View } from "react-native";
import type { BeneficioData, TipoBeneficio } from "../../type";

// Extend BeneficioData to include Appwrite document metadata
export interface Beneficio extends BeneficioData {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
}

interface BeneficioCardProps {
    beneficio: Beneficio;
}

const BENEFICIO_ASSETS: Record<
    TipoBeneficio,
    { background: number; icon: number }
> = {
    anuncio: {
        background: require("../../assets/images/ANUNCIO-beneficio.png"),
        icon: require("../../assets/images/ANUNCIO-icono.png"),
    },
    descuento: {
        background: require("../../assets/images/DESCUENTO-beneficio.png"),
        icon: require("../../assets/images/DESCUENTO-icono.png"),
    },
    promocion: {
        background: require("../../assets/images/PROMOCION-beneficio.png"),
        icon: require("../../assets/images/Promocion-icono.png"),
    },
};

const BENEFICIO_LABELS: Record<TipoBeneficio, string> = {
    anuncio: "Anuncio",
    descuento: "Descuento",
    promocion: "Promocion",
};

export default function BeneficioCard({ beneficio }: BeneficioCardProps) {
    // Default to "anuncio" if tipo_beneficio is not set
    const tipoBeneficio = beneficio.tipo_beneficio ?? "anuncio";
    const assets = BENEFICIO_ASSETS[tipoBeneficio];
    const label = BENEFICIO_LABELS[tipoBeneficio];

    return (
        <View className="rounded-[28px] overflow-hidden">
            <ImageBackground
                source={assets.background}
                resizeMode="cover"
                className="p-4"
            >
                <View className="flex-row items-start gap-4">
                    <View className="items-center self-center justify-center w-12 h-12 rounded-full bg-sos-bluegreen">
                        <Image
                            source={assets.icon}
                            resizeMode="contain"
                            className="w-12 h-12"
                        />
                    </View>

                    <View className="flex-1">
                        <Text
                            className="text-xl text-white font-poppins-bold"
                            numberOfLines={1}
                        >
                            {beneficio.titulo}
                        </Text>
                        <Text
                            className="mt-1 text-base text-white/95 font-poppins-medium"
                            numberOfLines={2}
                        >
                            {beneficio.descripcion}
                        </Text>
                    </View>

                    <View className="px-3 py-1 rounded-xl bg-sos-bluegreen">
                        <Text className="text-xs text-white font-poppins-semibold">
                            {label}
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}
