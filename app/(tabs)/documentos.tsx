import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import { useFocusEffect } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DocumentoCard from "@/components/documentos/DocumentoCard";
import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";

import {
    getCurrentUser,
    findMiembroByAuthUserId,
    getDocumentosByMiembro,
    getDocumentoBase64,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";
import type { DocumentoMedico } from "../../type";

const getFileDirectoryUri = (fileUri: string): string => {
    const lastSlashIndex = fileUri.lastIndexOf("/");
    return lastSlashIndex >= 0 ? fileUri.slice(0, lastSlashIndex + 1) : fileUri;
};

// Firmas base64 mínimas para validar que el contenido descargado sí coincide
// con el tipo de archivo esperado antes de reutilizar la caché.
const PDF_BASE64_SIGNATURE = "JVBERi0";
const IMAGE_BASE64_SIGNATURES = ["/9j/", "iVBOR", "R0lGOD", "UklGR"];
const MIN_VALID_PDF_SIZE_BYTES = 512;
const ANDROID_FLAG_GRANT_READ_URI_PERMISSION = 1;

const getDecodedBase64Size = (base64: string): number => {
    const paddingLength = base64.endsWith("==")
        ? 2
        : base64.endsWith("=")
          ? 1
          : 0;
    return Math.floor((base64.length * 3) / 4) - paddingLength;
};

const matchesExpectedBase64Signature = (
    tipoArchivo: DocumentoMedico["tipo_archivo"],
    base64: string,
): boolean => {
    if (tipoArchivo === "pdf") {
        return base64.startsWith(PDF_BASE64_SIGNATURE);
    }

    return IMAGE_BASE64_SIGNATURES.some((signature) =>
        base64.startsWith(signature),
    );
};

export default function DocumentosTabScreen() {
    const [documentos, setDocumentos] = useState<DocumentoMedico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
    const [pdfViewerNombre, setPdfViewerNombre] = useState<string>("");
    const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfViewerError, setPdfViewerError] = useState<string | null>(null);

    const [imageVisorUrl, setImageVisorUrl] = useState<string | null>(null);
    const [imageVisorVisible, setImageVisorVisible] = useState(false);

    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Restablece todo el estado del visor al cerrar el modal de PDF.
    const closePdfViewer = useCallback(() => {
        setPdfViewerVisible(false);
        setPdfViewerUrl(null);
        setPdfViewerNombre("");
        setPdfViewerError(null);
        setPdfLoading(false);
    }, []);

    // Centraliza la apertura del share sheet para no duplicar la configuración
    // entre iOS y Android cuando el PDF debe salir de la app.
    const openPdfShareSheet = useCallback(
        async (localUri: string, dialogTitle?: string) => {
            const sharingAvailable = await Sharing.isAvailableAsync();
            if (!sharingAvailable) {
                throw new Error(
                    "No hay una app disponible para abrir este PDF en este dispositivo.",
                );
            }

            await Sharing.shareAsync(localUri, {
            // Android necesita un intent explícito para entregar el archivo al visor
            // con MIME type y permiso temporal de lectura sobre el content URI.
                dialogTitle,
                mimeType: "application/pdf",
                UTI: "com.adobe.pdf",
            });
        },
        [],
    );

    const openPdfOnAndroid = useCallback(
        async (localUri: string) => {
            try {
                const contentUri =
                    await FileSystem.getContentUriAsync(localUri);
                await IntentLauncher.startActivityAsync(
                    "android.intent.action.VIEW",
                    {
                        data: contentUri,
                        flags: ANDROID_FLAG_GRANT_READ_URI_PERMISSION,
                        type: "application/pdf",
                    },
                );
                return;
            } catch {
                await openPdfShareSheet(localUri, "Abrir documento");
            }
        },
        [openPdfShareSheet],
    );

    // Verifica si un archivo cacheado sigue siendo utilizable antes de abrirlo.
    const isCachedFileValid = useCallback(
        async (
            localUri: string,
            tipoArchivo: DocumentoMedico["tipo_archivo"],
        ): Promise<boolean> => {
            const fileInfo = await FileSystem.getInfoAsync(localUri);
            if (
                !fileInfo.exists ||
                fileInfo.isDirectory ||
                fileInfo.size <= 0
            ) {
                return false;
            }

            if (
                tipoArchivo === "pdf" &&
                fileInfo.size < MIN_VALID_PDF_SIZE_BYTES
            ) {
                return false;
            }

            const fileHeaderBase64 = await FileSystem.readAsStringAsync(
                localUri,
                {
                    encoding: FileSystem.EncodingType.Base64,
                    position: 0,
                    length: 16,
                },
            );

            return matchesExpectedBase64Signature(
                tipoArchivo,
                fileHeaderBase64,
            );
        },
        [],
    );

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

    const downloadToCache = async (
        documento: DocumentoMedico,
    ): Promise<string> => {
        if (!FileSystem.cacheDirectory) {
            throw new Error(
                "No se encontró un directorio temporal disponible.",
            );
        }

        // Cada documento se guarda con su propio ID para poder reutilizarlo
        // mientras la copia local siga siendo válida.
        const extension = documento.tipo_archivo === "pdf" ? ".pdf" : ".jpg";
        const localUri = `${FileSystem.cacheDirectory}${documento.$id}${extension}`;

        const info = await FileSystem.getInfoAsync(localUri);
        if (info.exists) {
            const isValidCachedFile = await isCachedFileValid(
                localUri,
                documento.tipo_archivo,
            );
            if (isValidCachedFile) {
                return localUri;
            }

            await FileSystem.deleteAsync(localUri, { idempotent: true });
        }

        // Descarga el base64 desde la función, lo escribe en caché y luego
        // valida que el archivo escrito tenga el tamaño y firma esperados.
        const base64 = await getDocumentoBase64(documento.storage_archivo_id);
        const expectedFileSize = getDecodedBase64Size(base64);

        if (expectedFileSize <= 0) {
            throw new Error("El documento descargado llegó vacío.");
        }

        if (!matchesExpectedBase64Signature(documento.tipo_archivo, base64)) {
            throw new Error(
                documento.tipo_archivo === "pdf"
                    ? "El contenido recibido no parece ser un PDF válido."
                    : "El contenido recibido no parece ser una imagen válida.",
            );
        }

        await FileSystem.writeAsStringAsync(localUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const writtenFileInfo = await FileSystem.getInfoAsync(localUri);
        if (
            !writtenFileInfo.exists ||
            writtenFileInfo.isDirectory ||
            writtenFileInfo.size !== expectedFileSize
        ) {
            await FileSystem.deleteAsync(localUri, { idempotent: true });
            throw new Error(
                `El archivo descargado quedó incompleto (${writtenFileInfo.exists && !writtenFileInfo.isDirectory ? writtenFileInfo.size : 0} bytes).`,
            );
        }

        const isWrittenFileValid = await isCachedFileValid(
            localUri,
            documento.tipo_archivo,
        );
        if (!isWrittenFileValid) {
            await FileSystem.deleteAsync(localUri, { idempotent: true });
            throw new Error("El archivo descargado está corrupto.");
        }

        return localUri;
    };

    // Decide si el archivo se abre inline, en una app externa o en el visor de imagen.
    const handleVer = async (documento: DocumentoMedico) => {
        try {
            setActionLoading(`ver-${documento.$id}`);

            if (documento.tipo_archivo === "pdf") {
                const localUri = await downloadToCache(documento);
                if (Platform.OS === "ios") {
                    setPdfViewerError(null);
                    setPdfViewerUrl(localUri);
                    setPdfViewerNombre(documento.nombre_documento);
                    setPdfLoading(true);
                    setPdfViewerVisible(true);
                } else {
                    await openPdfOnAndroid(localUri);
                }
            } else {
                const localUri = await downloadToCache(documento);
                setImageVisorUrl(localUri);
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

    // Guarda imágenes en la galería y deja que los PDFs usen el share sheet.
    const handleDescargar = async (documento: DocumentoMedico) => {
        try {
            setActionLoading(`dl-${documento.$id}`);
            const localUri = await downloadToCache(documento);

            if (documento.tipo_archivo === "imagen") {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert(
                        "Permiso requerido",
                        "Necesitamos acceso a tu galería para guardar la imagen.",
                    );
                    return;
                }
                await MediaLibrary.saveToLibraryAsync(localUri);
                Alert.alert("¡Listo!", "Imagen guardada en tu galería.");
            } else {
                // Resetear el loading antes de abrir el share sheet para que
                // el botón no quede bloqueado si el usuario elige Print en iOS
                setActionLoading(null);
                try {
                    await openPdfShareSheet(localUri, "Guardar documento");
                } catch {
                    // El usuario descartó el share sheet o eligió Print — ok
                }
            }
        } catch (err) {
            Alert.alert(
                "Error",
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el documento",
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <View className="items-center justify-center flex-1">
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
                <View className="items-center justify-center flex-1 px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    const pdfViewerReadAccessUrl = pdfViewerUrl
        ? getFileDirectoryUri(pdfViewerUrl)
        : undefined;

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
                                <DocumentoCard
                                    key={doc.$id}
                                    documento={doc}
                                    actionLoading={actionLoading}
                                    onVer={handleVer}
                                    onGuardar={handleDescargar}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </TabScrollView>

            {/* Visor de PDF — iOS únicamente */}
            <Modal
                visible={pdfViewerVisible}
                animationType="slide"
                onRequestClose={closePdfViewer}
            >
                <View className="flex-1 bg-sos-white dark:bg-[#101822]">
                    <View className="flex-row items-center gap-3 px-4 pb-4 border-b border-gray-100 pt-14 dark:border-gray-800">
                        <Pressable
                            onPress={closePdfViewer}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar visor"
                            className="p-1"
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color={THEME_COLORS.sosBluegreen}
                            />
                        </Pressable>
                        <Text
                            className="flex-1 text-sm text-gray-900 font-poppins-bold dark:text-sos-white"
                            numberOfLines={1}
                        >
                            {pdfViewerNombre}
                        </Text>
                    </View>

                    {pdfViewerUrl && (
                        <WebView
                            source={{ uri: pdfViewerUrl }}
                            style={{ flex: 1 }}
                            allowFileAccess={true}
                            allowingReadAccessToURL={pdfViewerReadAccessUrl}
                            originWhitelist={[
                                "file://*",
                                "https://*",
                                "http://*",
                            ]}
                            onLoadStart={() => setPdfLoading(true)}
                            onLoadEnd={() => setPdfLoading(false)}
                            onError={() => {
                                setPdfLoading(false);
                                setPdfViewerError(
                                    "No pudimos mostrar este PDF dentro de la app.",
                                );
                            }}
                        />
                    )}

                    {pdfViewerError && pdfViewerUrl && (
                        <View className="absolute inset-0 top-24 px-6 justify-center items-center bg-sos-white dark:bg-[#101822]">
                            <MaterialCommunityIcons
                                name="file-pdf-box"
                                size={48}
                                color={THEME_COLORS.sosBluegreen}
                            />
                            <Text className="mt-4 text-base text-center text-gray-900 dark:text-sos-white font-poppins-semibold">
                                {pdfViewerError}
                            </Text>
                            <Text className="mt-2 text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                                Puedes abrirlo en otra app o imprimirlo desde la
                                hoja de compartir.
                            </Text>
                            <Pressable
                                onPress={async () => {
                                    try {
                                        await openPdfShareSheet(
                                            pdfViewerUrl,
                                            "Abrir documento",
                                        );
                                    } catch (err) {
                                        Alert.alert(
                                            "Error",
                                            err instanceof Error
                                                ? err.message
                                                : "No se pudo abrir el PDF en otra app.",
                                        );
                                    }
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Abrir PDF en otra app"
                                className="px-4 py-3 mt-5 rounded-xl bg-sos-bluegreen"
                            >
                                <Text className="text-sm text-sos-white font-poppins-semibold">
                                    Abrir en otra app
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {pdfLoading && (
                        <View className="absolute inset-0 items-center justify-center top-24">
                            <ActivityIndicator
                                size="large"
                                color={THEME_COLORS.sosBluegreen}
                            />
                            <Text className="mt-3 text-sm text-sos-gray font-poppins-medium">
                                Cargando documento...
                            </Text>
                        </View>
                    )}
                </View>
            </Modal>

            {/* Visor de imágenes */}
            <Modal
                visible={imageVisorVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setImageVisorVisible(false)}
            >
                <Pressable
                    className="items-center justify-center flex-1 bg-black/90"
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
