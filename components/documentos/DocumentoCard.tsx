import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { THEME_COLORS } from "@/libs/themeColors";
import type { DocumentoMedico, TipoDocumento } from "../../type";

interface DocumentoCardProps {
    documento: DocumentoMedico;
    actionLoading: string | null;
    onVer: (documento: DocumentoMedico) => void;
    onGuardar: (documento: DocumentoMedico) => void;
}

// Traduce el tipo almacenado en Appwrite a un texto legible para la UI.
const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
    laboratorio: "Laboratorio",
    radiologia: "Radiología",
    consulta_medica: "Consulta Médica",
    especialidades: "Especialidades",
    otro: "Otro",
};

// Presenta la fecha del documento con el formato esperado por la app.
const formatFecha = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export default function DocumentoCard({
    documento,
    actionLoading,
    onVer,
    onGuardar,
}: DocumentoCardProps) {
    const isBusy = actionLoading !== null;
    const isViewing = actionLoading === `ver-${documento.$id}`;
    const isDownloading = actionLoading === `dl-${documento.$id}`;

    return (
        <View className="rounded-[28px] border border-gray-100 bg-sos-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151f2b]">
            <View className="flex-row items-start gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-sos-bluegreen/10">
                    <MaterialCommunityIcons
                        name={
                            documento.tipo_archivo === "pdf"
                                ? "file-pdf-box"
                                : "file-image"
                        }
                        size={30}
                        color={THEME_COLORS.sosBluegreen}
                    />
                </View>

                <View className="flex-1">
                    <Text
                        className="text-base leading-6 text-gray-900 font-poppins-bold dark:text-sos-white"
                        numberOfLines={2}
                    >
                        {documento.nombre_documento}
                    </Text>

                    <View className="self-start px-3 py-1 mt-2 rounded-full bg-sos-bluegreen/10">
                        <Text className="text-sm text-sos-bluegreen font-poppins-semibold">
                            {TIPO_DOCUMENTO_LABELS[documento.tipo_documento]}
                        </Text>
                    </View>

                    <Text className="mt-2 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        {formatFecha(documento.fecha_documento)}
                    </Text>
                </View>
            </View>

            <View className="flex-row gap-3 mt-5">
                <Pressable
                    onPress={() => onVer(documento)}
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver ${documento.nombre_documento}`}
                    className="min-h-12 flex-1 items-center justify-center rounded-xl bg-sos-bluegreen px-4 py-3"
                    style={{ opacity: isBusy ? 0.6 : 1 }}
                >
                    <Text className="text-sm text-sos-white font-poppins-semibold">
                        {isViewing ? "Abriendo..." : "Ver"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => onGuardar(documento)}
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityLabel={`Descargar ${documento.nombre_documento}`}
                    className="min-h-12 flex-1 items-center justify-center rounded-xl border-2 border-sos-bluegreen bg-sos-white px-4 py-3 dark:bg-[#151f2b]"
                    style={{ opacity: isBusy ? 0.6 : 1 }}
                >
                    <Text className="text-sm text-sos-bluegreen font-poppins-semibold">
                        {isDownloading ? "Guardando..." : "Guardar"}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
