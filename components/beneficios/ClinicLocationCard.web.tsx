import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ClinicLocationCardProps {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

export default function ClinicLocationCard({
    name,
    address,
    latitude,
    longitude,
}: ClinicLocationCardProps) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    const handleOpenNavigation = () => {
        Linking.openURL(googleMapsUrl);
    };

    return (
        <View className="overflow-hidden rounded-2xl border border-gray-100 bg-sos-white shadow-sm dark:border-gray-800 dark:bg-[#151f2b]">
            {/* Placeholder del mapa en web */}
            <Pressable
                onPress={handleOpenNavigation}
                accessibilityRole="link"
                accessibilityLabel={`Abrir ${name} en Google Maps`}
                className="h-40 items-center justify-center bg-gray-100 dark:bg-gray-800/60 active:opacity-75"
            >
                <MaterialIcons name="map" size={32} color="#9CA3AF" />
                <Text className="mt-2 text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                    Abrir en Google Maps
                </Text>
            </Pressable>

            <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-1 mr-3">
                    <Text className="text-base font-poppins-bold text-gray-900 dark:text-sos-white">
                        {name}
                    </Text>
                    <Text className="mt-1 text-xs font-poppins-medium text-sos-gray dark:text-gray-400">
                        {address}
                    </Text>
                </View>

                <Pressable
                    onPress={handleOpenNavigation}
                    className="rounded-lg border border-sos-bluegreen/20 bg-sos-bluegreen/10 px-3 py-2 active:opacity-75"
                    accessibilityRole="link"
                    accessibilityLabel={`Abrir navegación hacia ${name}`}
                >
                    <Text className="text-xs font-poppins-semibold text-sos-bluegreen">
                        Ver ruta
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
