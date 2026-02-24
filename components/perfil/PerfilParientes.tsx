import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ParientesContentProps } from "@/type";

const SOS_BLUEGREEN = "#0066CC";

const PerfilParientes = React.memo(function PerfilParientes({
    isDark,
    parientes,
    loadingParientes,
    onToggleActivo,
    togglingId,
}: ParientesContentProps) {
    if (loadingParientes) {
        return (
            <View className="items-center py-6">
                <ActivityIndicator size="small" color={SOS_BLUEGREEN} />
                <Text className="mt-2 text-xs text-sos-gray dark:text-gray-400">
                    Cargando parientes...
                </Text>
            </View>
        );
    }

    const parentescoLabel = (p: string) => {
        const map: Record<string, string> = {
            hijo: "Hijo/a",
            conyuge: "Cónyuge",
            familiar: "Familiar",
        };
        return map[p] ?? p;
    };

    return (
        <View className="pt-4" style={{ gap: 12 }}>
            <Text className="font-sans text-sm text-sos-gray dark:text-gray-400">
                Aquí puedes ver y gestionar las cuentas de tus familiares
                vinculados.
            </Text>

            {parientes.length === 0 && (
                <Text className="py-4 text-sm text-center text-sos-gray dark:text-gray-400">
                    No tienes parientes vinculados todavía.
                </Text>
            )}

            {parientes.map((p) => {
                const isActive = !!p.activo;
                const isToggling = togglingId === p.$id;

                return (
                    <View
                        key={p.$id}
                        className="p-3 rounded-xl"
                        style={{
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
                            className="flex-row items-center"
                            style={{ gap: 12 }}
                        >
                            {/* Avatar */}
                            <View
                                className="items-center justify-center w-10 h-10 rounded-full"
                                style={{
                                    backgroundColor: isDark
                                        ? "rgba(0, 102, 204, 0.15)"
                                        : "rgba(0, 102, 204, 0.08)",
                                }}
                            >
                                <Text className="text-sm font-poppins-bold text-sos-bluegreen">
                                    {(p.nombre_completo ?? "?").charAt(0)}
                                </Text>
                            </View>

                            {/* Info */}
                            <View className="flex-1">
                                <Text className="text-sm text-gray-900 font-poppins-semibold dark:text-sos-white">
                                    {p.nombre_completo}
                                </Text>
                                <Text className="font-sans text-xs text-sos-gray dark:text-gray-400">
                                    {parentescoLabel(p.parentesco)}
                                </Text>
                            </View>

                            {/* Badge de estado */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{
                                    backgroundColor: isActive
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
                                        isActive
                                            ? "check-circle"
                                            : "hourglass-top"
                                    }
                                    size={12}
                                    color={
                                        isActive ? "#22c55e" : "#f59e0b"
                                    }
                                    style={{ marginRight: 4 }}
                                />
                                <Text
                                    className="text-xs font-poppins-medium"
                                    style={{
                                        color: isActive
                                            ? "#22c55e"
                                            : "#f59e0b",
                                    }}
                                >
                                    {isActive ? "Activo" : "Inactivo"}
                                </Text>
                            </View>
                        </View>

                        {/* Botón activar / desactivar */}
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                isActive
                                    ? `Desactivar cuenta de ${p.nombre_completo}`
                                    : `Activar cuenta de ${p.nombre_completo}`
                            }
                            disabled={isToggling}
                            onPress={() => onToggleActivo(p.$id, p.activo)}
                            className="flex-row items-center justify-center py-2 mt-3 rounded-lg active:opacity-80"
                            style={{
                                backgroundColor: isActive
                                    ? isDark
                                        ? "rgba(204, 51, 51, 0.12)"
                                        : "rgba(204, 51, 51, 0.08)"
                                    : isDark
                                      ? "rgba(34, 197, 94, 0.12)"
                                      : "rgba(34, 197, 94, 0.08)",
                            }}
                        >
                            {isToggling ? (
                                <ActivityIndicator
                                    size="small"
                                    color={isActive ? "#CC3333" : "#22c55e"}
                                />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name={
                                            isActive
                                                ? "person-off"
                                                : "person-add"
                                        }
                                        size={16}
                                        color={
                                            isActive ? "#CC3333" : "#22c55e"
                                        }
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text
                                        className="text-xs font-poppins-semibold"
                                        style={{
                                            color: isActive
                                                ? "#CC3333"
                                                : "#22c55e",
                                        }}
                                    >
                                        {isActive
                                            ? "Desactivar cuenta"
                                            : "Activar cuenta"}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                );
            })}

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
