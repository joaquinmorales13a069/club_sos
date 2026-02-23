import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface TitularFoundCardProps {
    /** Full name of the titular */
    nombreCompleto: string;
    /** Identity document of the titular */
    documentoIdentidad: string;
    /** Company name to display (read from AsyncStorage, avoids extra DB call) */
    nombreEmpresa: string;
}

/**
 * Presentational card shown after a successful titular lookup.
 * Displays the titular's name, document and linked company.
 * Contains NO business logic or queries.
 */
export default function TitularFoundCard({
    nombreCompleto,
    documentoIdentidad,
    nombreEmpresa,
}: TitularFoundCardProps) {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    return (
        <View
            className="overflow-hidden rounded-2xl bg-sos-white dark:bg-[#1A262B] border border-gray-100 dark:border-gray-700"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0 : 0.08,
                shadowRadius: 16,
                elevation: 6,
            }}
        >
            {/* Decorative top bar */}
            <View className="h-1.5 w-full bg-sos-bluegreen" />

            <View
                className="flex-row items-start p-5"
                style={{ gap: 16 }}
            >
                {/* Check circle avatar */}
                <View className="justify-center items-center w-14 h-14 bg-green-50 rounded-full shrink-0 dark:bg-green-900/30">
                    <MaterialIcons
                        name="check-circle"
                        size={30}
                        color="#16a34a"
                    />
                </View>

                <View className="flex-1 min-w-0">
                    {/* Badge */}
                    <View className="flex-row items-center mb-1">
                        <View className="px-2 py-1 bg-green-50 rounded-md dark:bg-green-900/40">
                            <Text className="text-xs text-green-700 font-poppins-bold dark:text-green-300">
                                Titular encontrado
                            </Text>
                        </View>
                    </View>

                    {/* Titular name */}
                    <Text
                        className="text-lg text-gray-900 font-poppins-bold dark:text-sos-white"
                        numberOfLines={1}
                    >
                        {nombreCompleto}
                    </Text>

                    {/* Document */}
                    <View
                        className="flex-row items-center mt-1"
                        style={{ gap: 6 }}
                    >
                        <MaterialIcons
                            name="fingerprint"
                            size={16}
                            color={isDark ? "#9ca3af" : "#666666"}
                            style={{ opacity: 0.7 }}
                        />
                        <Text className="text-sm font-poppins-medium text-sos-gray dark:text-gray-400">
                            {documentoIdentidad}
                        </Text>
                    </View>

                    {/* Company name */}
                    <View
                        className="flex-row items-center mt-0.5"
                        style={{ gap: 6 }}
                    >
                        <MaterialIcons
                            name="domain"
                            size={16}
                            color={isDark ? "#9ca3af" : "#666666"}
                            style={{ opacity: 0.7 }}
                        />
                        <Text
                            className="text-sm font-poppins-medium text-sos-gray dark:text-gray-400"
                            numberOfLines={1}
                        >
                            {nombreEmpresa}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
