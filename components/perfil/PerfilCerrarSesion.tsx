import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { CerrarSesionContentProps } from "@/type";

const SOS_RED = "#CC3333";

const PerfilCerrarSesion = React.memo(function PerfilCerrarSesion({
    isDark,
}: CerrarSesionContentProps) {
    return (
        <View className="pt-4" style={{ gap: 16 }}>
            <Text className="font-sans text-sm text-sos-gray dark:text-gray-400">
                Al cerrar sesión se eliminará tu información local. Podrás
                iniciar sesión nuevamente con tu número de teléfono.
            </Text>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar sesión"
                className="flex-row items-center justify-center w-full h-12 rounded-full active:opacity-90"
                style={{
                    backgroundColor: isDark
                        ? "rgba(204, 51, 51, 0.12)"
                        : "rgba(204, 51, 51, 0.06)",
                    borderWidth: 2,
                    borderColor: isDark
                        ? "rgba(204, 51, 51, 0.3)"
                        : "rgba(204, 51, 51, 0.2)",
                }}
            >
                <MaterialIcons
                    name="logout"
                    size={18}
                    color={SOS_RED}
                    style={{ marginRight: 8 }}
                />
                <Text className="text-base font-poppins-bold text-sos-red">
                    Cerrar sesión
                </Text>
            </Pressable>
        </View>
    );
});

export default PerfilCerrarSesion;
