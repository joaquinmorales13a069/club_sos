import { MaterialIcons } from "@expo/vector-icons";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    memo,
} from "react";
import {
    Animated,
    ActivityIndicator,
    Alert,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    Text,
    TextInput,
    UIManager,
    useColorScheme,
    View,
} from "react-native";
import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";
import AccordionCard from "@/components/perfil/AccordionCard";
import PerfilDatosPersonales from "@/components/perfil/PerfilDatosPersonales";
import PerfilNotificaciones from "@/components/perfil/PerfilNotificaciones";
import PerfilParientes from "@/components/perfil/PerfilParientes";
import PerfilCerrarSesion from "@/components/perfil/PerfilCerrarSesion";
import {
    getCurrentUser,
    findMiembroByAuthUserId,
    getEmpresaById,
} from "@/libs/appwrite";
import type { AccordionKey, AccordionSection } from "@/type";

// Enable LayoutAnimation on Android
if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Brand colour constants for inline style props
const SOS_RED = "#CC3333";
const SOS_BLUEGREEN = "#0066CC";

const SECTIONS: AccordionSection[] = [
    {
        key: "datos",
        title: "Mis datos personales",
        subtitle: "Edita tu información de perfil",
        icon: "person",
        iconBg: "#eff6ff",
        iconBgDark: "rgba(0, 102, 204, 0.15)",
        iconColor: SOS_BLUEGREEN,
    },
    {
        key: "notificaciones",
        title: "Notificaciones",
        subtitle: "Administra tus preferencias",
        icon: "notifications",
        iconBg: "#fef3c7",
        iconBgDark: "rgba(245, 158, 11, 0.15)",
        iconColor: "#f59e0b",
    },
    {
        key: "parientes",
        title: "Cuentas de parientes",
        subtitle: "Vincula familiares a tu cuenta",
        icon: "family-restroom",
        iconBg: "#f0fdf4",
        iconBgDark: "rgba(34, 197, 94, 0.15)",
        iconColor: "#22c55e",
    },
    {
        key: "cerrar_sesion",
        title: "Cerrar sesión",
        subtitle: "Salir de tu cuenta",
        icon: "logout",
        iconBg: "#fef2f2",
        iconBgDark: "rgba(204, 51, 51, 0.15)",
        iconColor: SOS_RED,
    },
];

// ─── Screen ─────────────────────────────────────────────────
export default function PerfilTabScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const [expandedKey, setExpandedKey] = useState<AccordionKey | null>(null);

    // Member data state
    const [miembro, setMiembro] = useState<any>(null);
    const [empresa, setEmpresa] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editable fields state
    const [nombre, setNombre] = useState("");
    const [documento, setDocumento] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono] = useState("");

    // Notification toggles
    const [notifCitas, setNotifCitas] = useState(true);
    const [notifBeneficios, setNotifBeneficios] = useState(true);
    const [notifGeneral, setNotifGeneral] = useState(false);

    // Load user data on mount (only once)
    useEffect(() => {
        loadUserData();
    }, []);

    // Update editable fields when miembro data changes
    useEffect(() => {
        if (miembro) {
            setNombre(miembro.nombre_completo || "");
            setDocumento(miembro.documento_identidad || "");
            setCorreo(miembro.correo || "");
        }
    }, [miembro]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = await getCurrentUser();
            if (!user) {
                setError("Usuario no autenticado");
                return;
            }

            const miembroData = await findMiembroByAuthUserId(user.$id);
            if (!miembroData) {
                setError("No se encontraron datos del miembro");
                return;
            }

            setMiembro(miembroData);

            if (miembroData.empresa_id) {
                const empresaData = await getEmpresaById(
                    miembroData.empresa_id,
                );
                setEmpresa(empresaData);
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error desconocido";
            setError(message);
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = useCallback((key: AccordionKey) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedKey((prev) => (prev === key ? null : key));
    }, []);

    const formatDate = (isoString: string): string => {
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const dd = String(date.getDate()).padStart(2, "0");
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yyyy = String(date.getFullYear());
            return `${dd}/${mm}/${yyyy}`;
        } catch {
            return isoString;
        }
    };

    // Loading state
    if (loading) {
        return (
            <TabScreenView className="flex-1 items-center justify-center bg-sos-white dark:bg-[#101822]">
                <ActivityIndicator
                    size="large"
                    color={SOS_BLUEGREEN}
                    style={{ marginBottom: 12 }}
                />
                <Text className="text-sm text-sos-gray dark:text-gray-400">
                    Cargando datos...
                </Text>
            </TabScreenView>
        );
    }

    // Error state
    if (error || !miembro) {
        return (
            <TabScreenView className="flex-1 items-center justify-center bg-sos-white dark:bg-[#101822] px-6">
                <MaterialIcons
                    name="error-outline"
                    size={48}
                    color={SOS_RED}
                    style={{ marginBottom: 16 }}
                />
                <Text className="mb-2 text-base text-center text-gray-900 font-poppins-semibold dark:text-sos-white">
                    {error || "Error al cargar datos"}
                </Text>
                <Pressable
                    onPress={loadUserData}
                    className="px-6 py-2 mt-4 rounded-full bg-sos-bluegreen"
                >
                    <Text className="text-sos-white font-poppins-semibold">
                        Reintentar
                    </Text>
                </Pressable>
            </TabScreenView>
        );
    }

    // Main render
    return (
        <TabScreenView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TabScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header / Avatar */}
                <View className="items-center px-6 pt-6 pb-2">
                    <View
                        className="items-center justify-center w-20 h-20 mb-3 rounded-full"
                        style={{
                            backgroundColor: isDark
                                ? "rgba(0, 102, 204, 0.15)"
                                : "rgba(0, 102, 204, 0.1)",
                        }}
                    >
                        <Image
                            source={require("../../assets/images/GOTA.png")}
                            accessibilityLabel="Avatar de usuario"
                            resizeMode="contain"
                            className="w-12 h-12"
                        />
                    </View>

                    <Text className="text-2xl leading-tight text-sos-bluegreen font-poppins-bold dark:text-sos-white">
                        {miembro.nombre_completo}
                    </Text>
                    <Text className="mt-1 text-sm font-poppins-semibold text-sos-gray dark:text-gray-400">
                        {empresa?.nombre_empresa || "Empresa"} ·{" "}
                        {miembro.parentesco === "titular"
                            ? "Titular"
                            : miembro.parentesco}
                    </Text>

                    <View
                        className="flex-row items-center mt-3 px-3 py-1.5 rounded-full"
                        style={{
                            backgroundColor: isDark
                                ? "rgba(34, 197, 94, 0.12)"
                                : "rgba(34, 197, 94, 0.08)",
                            borderWidth: 1,
                            borderColor: isDark
                                ? "rgba(34, 197, 94, 0.25)"
                                : "rgba(34, 197, 94, 0.2)",
                        }}
                    >
                        <MaterialIcons
                            name="check-circle"
                            size={14}
                            color="#22c55e"
                            style={{ marginRight: 4 }}
                        />
                        <Text className="text-xs text-green-600 font-poppins-semibold dark:text-green-400">
                            Cuenta activa
                        </Text>
                    </View>
                </View>

                {/* Accordion Sections */}
                <View className="px-4 mt-6" style={{ gap: 12 }}>
                    {SECTIONS.map((section) => (
                        <AccordionCard
                            key={section.key}
                            section={section}
                            isExpanded={expandedKey === section.key}
                            onToggle={() => toggleSection(section.key)}
                            isDark={isDark}
                        >
                            {section.key === "datos" && (
                                <PerfilDatosPersonales
                                    isDark={isDark}
                                    nombre={nombre}
                                    setNombre={setNombre}
                                    documento={documento}
                                    setDocumento={setDocumento}
                                    correo={correo}
                                    setCorreo={setCorreo}
                                    telefono={miembro.telefono || ""}
                                    sexo={miembro.sexo || ""}
                                    fechaNacimiento={formatDate(
                                        miembro.fecha_nacimiento || "",
                                    )}
                                />
                            )}
                            {section.key === "notificaciones" && (
                                <PerfilNotificaciones
                                    isDark={isDark}
                                    notifCitas={notifCitas}
                                    setNotifCitas={setNotifCitas}
                                    notifBeneficios={notifBeneficios}
                                    setNotifBeneficios={setNotifBeneficios}
                                    notifGeneral={notifGeneral}
                                    setNotifGeneral={setNotifGeneral}
                                />
                            )}
                            {section.key === "parientes" && (
                                <PerfilParientes isDark={isDark} />
                            )}
                            {section.key === "cerrar_sesion" && (
                                <PerfilCerrarSesion isDark={isDark} />
                            )}
                        </AccordionCard>
                    ))}
                </View>

                {/* App version */}
                <View className="items-center px-6 mt-8">
                    <Text className="font-sans text-xs text-sos-gray dark:text-gray-500">
                        ClubSOS v1.0.0
                    </Text>
                </View>
            </TabScrollView>
        </TabScreenView>
    );
}
