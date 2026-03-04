import React from "react";
import { Alert, Platform, Pressable, Text, View, Linking } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

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
    const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    const handleOpenNavigation = () => {
        const latLng = `${latitude},${longitude}`;
        const label = encodeURIComponent(`${name} - ${address}`);

        const appleMapsUrl = `http://maps.apple.com/?ll=${latLng}&q=${label}`;
        const geoUrl = `geo:${latLng}?q=${latLng}(${label})`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

        const url =
            Platform.select({
                ios: appleMapsUrl,
                android: geoUrl,
                default: googleMapsUrl,
            }) ?? googleMapsUrl;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    return Linking.openURL(googleMapsUrl);
                }
                return Linking.openURL(url);
            })
            .catch(() => {
                Alert.alert(
                    "Mapa",
                    "No se pudo abrir la aplicación de navegación en este dispositivo.",
                );
            });
    };

    return (
        <View className="overflow-hidden rounded-2xl border border-gray-100 bg-sos-white shadow-sm dark:border-gray-800 dark:bg-[#151f2b]">
            <View className="h-40 bg-gray-200 dark:bg-gray-700">
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={region}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                >
                    <Marker coordinate={{ latitude, longitude }} title={name} />
                </MapView>
            </View>

            <View className="flex-row justify-between items-center px-4 py-3">
                <View className="flex-1 mr-3">
                    <Text className="text-base text-gray-900 dark:text-sos-white font-poppins-bold">
                        {name}
                    </Text>
                    <Text className="mt-1 text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                        {address}
                    </Text>
                </View>

                <Pressable
                    onPress={handleOpenNavigation}
                    className="px-3 py-2 rounded-lg border border-sos-bluegreen/20 bg-sos-bluegreen/10"
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir navegación hacia ${name}`}
                >
                    <Text className="text-xs text-sos-bluegreen font-poppins-semibold">
                        Ver ruta
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

