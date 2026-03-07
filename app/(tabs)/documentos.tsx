import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";

import {
    getCurrentUser,
    findMiembroByAuthUserId,
    getDocumentosByMiembro,
    getDocumentoFileUrl,
    getDocumentoDownloadUrl,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";
import type { DocumentoMedico, TipoDocumento } from "../../type";

const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
    laboratorio: "Laboratorio",
    radiologia: "Radiología",
    consulta_medica: "Consulta Médica",
    especialidades: "Especialidades",
    otro: "Otro",
};

const formatFecha = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export default function DocumentosTabScreen() {
    const [documentos, setDocumentos] = useState<DocumentoMedico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [imageVisorUrl, setImageVisorUrl] = useState<string | null>(null);
    const [imageVisorVisible, setImageVisorVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadDocumentos = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) throw new Error("Usuario no autenticado");

            const miembroDoc = await findMiembroByAuthUserId(currentUser.$id);
            if (!miembroDoc) {
                setDocumentos([]);
                return;
            }

            const docs = await getDocumentosByMiembro(miembroDoc.$id);
            setDocumentos(docs);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar los documentos",
            );
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (hasLoadedOnce) {
                loadDocumentos(false);
            } else {
                loadDocumentos(true);
            }
        }, [loadDocumentos, hasLoadedOnce]),
    );

    const handleVer = async (documento: DocumentoMedico) => {
        try {
            setActionLoading(`ver-${documento.$id}`);
            const url = await getDocumentoFileUrl(documento.storage_archivo_id);

            if (documento.tipo_archivo === "pdf") {
                await WebBrowser.openBrowserAsync(url);
            } else {
                setImageVisorUrl(url);
                setImageVisorVisible(true);
            }
        } catch (err) {
            Alert.alert(
                "Error",
                err instanceof Error
                    ? err.message
                    : "No se pudo abrir el documento",
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleDescargar = async (documento: DocumentoMedico) => {
        try {
            setActionLoading(`dl-${documento.$id}`);
            const url = await getDocumentoDownloadUrl(
                documento.storage_archivo_id,
            );
            const extension =
                documento.tipo_archivo === "pdf" ? ".pdf" : ".jpg";
            const localUri = `${FileSystem.cacheDirectory}${documento.nombre_documento}${extension}`;

            const { uri } = await FileSystem.downloadAsync(url, localUri);
            await Sharing.shareAsync(uri);
        } catch (err) {
            Alert.alert(
                "Error",
                err instanceof Error
                    ? err.message
                    : "No se pudo descargar el documento",
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator
                        size="large"
                        color={THEME_COLORS.sosBluegreen}
                    />
                    <Text className="mt-4 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        Cargando documentos...
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    if (error) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    return (
        <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TabScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="pt-6">
                    <Text className="mb-4 text-2xl text-sos-bluegreen dark:text-sos-white font-poppins-bold">
                        Mis Documentos
                    </Text>

                    {documentos.length === 0 ? (
                        <View className="px-4 py-8 rounded-2xl bg-gray-50 dark:bg-[#151f2b]">
                            <Text className="text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                                No tienes documentos disponibles aún.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {documentos.map((doc) => (
                                <View
                                    key={doc.$id}
                                    className="flex-row items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-sos-white shadow-sm dark:border-gray-800 dark:bg-[#151f2b]"
                                >
                                    {/* Icono tipo de archivo */}
                                    <View className="justify-center items-center w-12 h-12 rounded-full bg-sos-bluegreen/10">
                                        <MaterialCommunityIcons
                                            name={
                                                doc.tipo_archivo === "pdf"
                                                    ? "file-pdf-box"
                                                    : "file-image"
                                            }
                                            size={28}
                                            color={THEME_COLORS.sosBluegreen}
                                        />
                                    </View>

                                    {/* Información del documento */}
                                    <View className="flex-1">
                                        <Text
                                            className="text-sm font-poppins-bold text-gray-900 dark:text-sos-white"
                                            numberOfLines={2}
                                        >
                                            {doc.nombre_documento}
                                        </Text>
                                        <Text className="mt-0.5 text-xs text-sos-bluegreen font-poppins-medium">
                                            {TIPO_DOCUMENTO_LABELS[doc.tipo_documento]}
                                        </Text>
                                        <Text className="mt-0.5 text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                                            {formatFecha(doc.fecha_documento)}
                                        </Text>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="gap-2">
                                        <Pressable
                                            onPress={() => handleVer(doc)}
                                            disabled={actionLoading !== null}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Ver ${doc.nombre_documento}`}
                                            className="px-3 py-1.5 rounded-lg bg-sos-bluegreen items-center"
                                        >
                                            <Text className="text-xs text-sos-white font-poppins-semibold">
                                                {actionLoading === `ver-${doc.$id}`
                                                    ? "..."
                                                    : "Ver"}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => handleDescargar(doc)}
                                            disabled={actionLoading !== null}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Descargar ${doc.nombre_documento}`}
                                            className="px-3 py-1.5 rounded-lg border border-sos-bluegreen items-center"
                                        >
                                            <Text className="text-xs text-sos-bluegreen font-poppins-semibold">
                                                {actionLoading === `dl-${doc.$id}`
                                                    ? "..."
                                                    : "Guardar"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </TabScrollView>

            {/* Visor de imágenes */}
            <Modal
                visible={imageVisorVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setImageVisorVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/90 justify-center items-center"
                    onPress={() => setImageVisorVisible(false)}
                >
                    <Image
                        source={{ uri: imageVisorUrl ?? "" }}
                        resizeMode="contain"
                        style={{ width: "95%", height: "80%" }}
                    />
                    <Text className="mt-4 text-sm text-white/60 font-poppins-medium">
                        Toca para cerrar
                    </Text>
                </Pressable>
            </Modal>
        </TabScreenView>
    );
}
