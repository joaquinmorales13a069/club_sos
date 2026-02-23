import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ParientesContentProps } from "@/type";

const SOS_BLUEGREEN = "#0066CC";

const PerfilParientes = React.memo(function PerfilParientes({
    isDark,
}: ParientesContentProps) {
    const parientes = [
        {
            nombre: "Ana Morales",
            parentesco: "Cónyuge",
            estado: "activo",
        },
        {
            nombre: "Carlos Morales",
            parentesco: "Hijo",
            estado: "pendiente",
        },
    ];

    return (
        <View className="pt-4" style={{ gap: 12 }}>
            <Text className="font-sans text-sm text-sos-gray dark:text-gray-400">
                Aquí puedes ver y gestionar las cuentas de tus familiares
                vinculados.
            </Text>

            {parientes.map((p, index) => (
                <View
                    key={index}
                    className="flex-row items-center p-3 rounded-xl"
                    style={{
                        gap: 12,
                        backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.03)"
                            : "rgba(0, 0, 0, 0.02)",
                        borderWidth: 1,
                        borderColor: isDark
                            ? "rgba(255, 255, 255, 0.06)"
                            : "rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <View
                        className="items-center justify-center w-10 h-10 rounded-full"
                        style={{
                            backgroundColor: isDark
                                ? "rgba(0, 102, 204, 0.15)"
                                : "rgba(0, 102, 204, 0.08)",
                        }}
                    >
                        <Text className="text-sm font-poppins-bold text-sos-bluegreen">
                            {p.nombre.charAt(0)}
                        </Text>
                    </View>

                    <View className="flex-1">
                        <Text className="text-sm text-gray-900 font-poppins-semibold dark:text-sos-white">
                            {p.nombre}
                        </Text>
                        <Text className="font-sans text-xs text-sos-gray dark:text-gray-400">
                            {p.parentesco}
                        </Text>
                    </View>

                    <View
                        className="flex-row items-center px-2.5 py-1 rounded-full"
                        style={{
                            backgroundColor:
                                p.estado === "activo"
                                    ? isDark
                                        ? "rgba(34, 197, 94, 0.12)"
                                        : "rgba(34, 197, 94, 0.08)"
                                    : isDark
                                      ? "rgba(245, 158, 11, 0.12)"
                                      : "rgba(245, 158, 11, 0.08)",
                        }}
                    >
                        <MaterialIcons
                            name={
                                p.estado === "activo"
                                    ? "check-circle"
                                    : "hourglass-top"
                            }
                            size={12}
                            color={
                                p.estado === "activo" ? "#22c55e" : "#f59e0b"
                            }
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            className="text-xs font-poppins-medium"
                            style={{
                                color:
                                    p.estado === "activo"
                                        ? "#22c55e"
                                        : "#f59e0b",
                            }}
                        >
                            {p.estado === "activo" ? "Activo" : "Pendiente"}
                        </Text>
                    </View>
                </View>
            ))}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Vincular nuevo pariente"
                className="flex-row items-center justify-center w-full py-3 mt-1 rounded-xl active:opacity-80"
                style={{
                    borderWidth: 2,
                    borderColor: isDark
                        ? "rgba(0, 102, 204, 0.3)"
                        : "rgba(0, 102, 204, 0.2)",
                    borderStyle: "dashed",
                }}
            >
                <MaterialIcons
                    name="person-add"
                    size={18}
                    color={SOS_BLUEGREEN}
                    style={{ marginRight: 8 }}
                />
                <Text className="text-sm font-poppins-semibold text-sos-bluegreen">
                    Vincular nuevo pariente
                </Text>
            </Pressable>
        </View>
    );
});

export default PerfilParientes;
