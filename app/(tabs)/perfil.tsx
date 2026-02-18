import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    UIManager,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

// ─── Mock Data ──────────────────────────────────────────────
const miembroMock = {
    nombre_completo: "Joaquin Morales",
    documento_identidad: "0012412970005N",
    fecha_nacimiento: "1995-06-15T00:00:00.000Z",
    sexo: "Masculino",
    telefono: "+50588888888",
    correo: "joaquin@ejemplo.com",
    empresa_nombre: "SOS Medical",
    parentesco: "titular",
};

// ─── Types ──────────────────────────────────────────────────
type AccordionKey =
    | "datos"
    | "notificaciones"
    | "parientes"
    | "cerrar_sesion";

interface AccordionSection {
    key: AccordionKey;
    title: string;
    subtitle: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    iconBg: string;
    iconBgDark: string;
    iconColor: string;
}

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

    // Editable fields state
    const [nombre, setNombre] = useState(miembroMock.nombre_completo);
    const [documento, setDocumento] = useState(miembroMock.documento_identidad);
    const [correo, setCorreo] = useState(miembroMock.correo);
    const [telefono] = useState(miembroMock.telefono);

    // Notification toggles
    const [notifCitas, setNotifCitas] = useState(true);
    const [notifBeneficios, setNotifBeneficios] = useState(true);
    const [notifGeneral, setNotifGeneral] = useState(false);

    const toggleSection = useCallback(
        (key: AccordionKey) => {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
            );
            setExpandedKey((prev) => (prev === key ? null : key));
        },
        [],
    );

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

    // ─── Render ─────────────────────────────────────────────
    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Header / Avatar ────────────────────────────── */}
                <View className="items-center px-6 pt-6 pb-2">
                    {/* Avatar */}
                    <View
                        className="items-center justify-center w-20 h-20 rounded-full mb-3"
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
                            className="h-10 w-10"
                        />
                    </View>

                    <Text className="text-xl leading-tight text-gray-900 font-poppins-bold dark:text-sos-white">
                        {miembroMock.nombre_completo}
                    </Text>
                    <Text className="mt-1 text-sm font-poppins-medium text-sos-gray dark:text-gray-400">
                        {miembroMock.empresa_nombre} ·{" "}
                        {miembroMock.parentesco === "titular"
                            ? "Titular"
                            : miembroMock.parentesco}
                    </Text>

                    {/* Status badge */}
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
                        <Text className="text-xs font-poppins-semibold text-green-600 dark:text-green-400">
                            Cuenta activa
                        </Text>
                    </View>
                </View>

                {/* ── Accordion Sections ─────────────────────────── */}
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
                                <DatosPersonalesContent
                                    isDark={isDark}
                                    nombre={nombre}
                                    setNombre={setNombre}
                                    documento={documento}
                                    setDocumento={setDocumento}
                                    correo={correo}
                                    setCorreo={setCorreo}
                                    telefono={telefono}
                                    sexo={miembroMock.sexo}
                                    fechaNacimiento={formatDate(
                                        miembroMock.fecha_nacimiento,
                                    )}
                                />
                            )}
                            {section.key === "notificaciones" && (
                                <NotificacionesContent
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
                                <ParientesContent isDark={isDark} />
                            )}
                            {section.key === "cerrar_sesion" && (
                                <CerrarSesionContent isDark={isDark} />
                            )}
                        </AccordionCard>
                    ))}
                </View>

                {/* ── App version ────────────────────────────────── */}
                <View className="items-center mt-8 px-6">
                    <Text className="text-xs font-sans text-sos-gray dark:text-gray-500">
                        ClubSOS v1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Accordion Card Component ───────────────────────────────
interface AccordionCardProps {
    section: AccordionSection;
    isExpanded: boolean;
    onToggle: () => void;
    isDark: boolean;
    children: React.ReactNode;
}

function AccordionCard({
    section,
    isExpanded,
    onToggle,
    isDark,
    children,
}: AccordionCardProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: isExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isExpanded, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    return (
        <View
            className="rounded-2xl bg-sos-white dark:bg-[#151f2b] overflow-hidden"
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.06,
                shadowRadius: 8,
                elevation: isDark ? 0 : 2,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "transparent",
            }}
        >
            {/* Header (pressable) */}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={section.title}
                accessibilityState={{ expanded: isExpanded }}
                onPress={onToggle}
                className="flex-row items-center p-4 active:opacity-80"
                style={{ gap: 12 }}
            >
                {/* Icon */}
                <View
                    className="items-center justify-center w-10 h-10 rounded-xl"
                    style={{
                        backgroundColor: isDark
                            ? section.iconBgDark
                            : section.iconBg,
                    }}
                >
                    <MaterialIcons
                        name={section.icon}
                        size={22}
                        color={section.iconColor}
                    />
                </View>

                {/* Title + Subtitle */}
                <View className="flex-1">
                    <Text className="text-base font-poppins-semibold text-gray-900 dark:text-sos-white">
                        {section.title}
                    </Text>
                    <Text className="text-xs font-sans text-sos-gray dark:text-gray-400 mt-0.5">
                        {section.subtitle}
                    </Text>
                </View>

                {/* Chevron */}
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <MaterialIcons
                        name="expand-more"
                        size={24}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                </Animated.View>
            </Pressable>

            {/* Content (shown when expanded) */}
            {isExpanded && (
                <View
                    className="px-4 pb-4"
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: isDark
                            ? "rgba(255, 255, 255, 0.06)"
                            : "rgba(0, 0, 0, 0.05)",
                    }}
                >
                    {children}
                </View>
            )}
        </View>
    );
}

// ─── Datos Personales Content ───────────────────────────────
interface DatosPersonalesProps {
    isDark: boolean;
    nombre: string;
    setNombre: (v: string) => void;
    documento: string;
    setDocumento: (v: string) => void;
    correo: string;
    setCorreo: (v: string) => void;
    telefono: string;
    sexo: string;
    fechaNacimiento: string;
}

function DatosPersonalesContent({
    isDark,
    nombre,
    setNombre,
    documento,
    setDocumento,
    correo,
    setCorreo,
    telefono,
    sexo,
    fechaNacimiento,
}: DatosPersonalesProps) {
    return (
        <View className="pt-4" style={{ gap: 16 }}>
            {/* Nombre completo */}
            <ProfileField
                label="Nombre completo"
                icon="person-outline"
                isDark={isDark}
            >
                <TextInput
                    accessibilityLabel="Nombre completo"
                    value={nombre}
                    onChangeText={setNombre}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A262B] text-gray-900 dark:text-sos-white text-base font-sans"
                    style={{
                        paddingVertical: 14,
                        paddingLeft: 44,
                        paddingRight: 16,
                    }}
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    autoCapitalize="words"
                />
            </ProfileField>

            {/* Documento de identidad */}
            <ProfileField
                label="Documento de identidad"
                icon="badge"
                isDark={isDark}
            >
                <TextInput
                    accessibilityLabel="Documento de identidad"
                    value={documento}
                    onChangeText={setDocumento}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A262B] text-gray-900 dark:text-sos-white text-base font-sans"
                    style={{
                        paddingVertical: 14,
                        paddingLeft: 44,
                        paddingRight: 16,
                    }}
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    autoCapitalize="characters"
                />
            </ProfileField>

            {/* Correo electrónico */}
            <ProfileField
                label="Correo electrónico"
                icon="email"
                isDark={isDark}
            >
                <TextInput
                    accessibilityLabel="Correo electrónico"
                    value={correo}
                    onChangeText={setCorreo}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A262B] text-gray-900 dark:text-sos-white text-base font-sans"
                    style={{
                        paddingVertical: 14,
                        paddingLeft: 44,
                        paddingRight: 16,
                    }}
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </ProfileField>

            {/* Teléfono (read-only) */}
            <ProfileField
                label="Teléfono"
                icon="phone"
                isDark={isDark}
                badge="Verificado"
            >
                <TextInput
                    accessibilityLabel="Teléfono verificado"
                    value={telefono}
                    editable={false}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A262B] text-gray-500 dark:text-gray-400 text-base font-sans"
                    style={{
                        paddingVertical: 14,
                        paddingLeft: 44,
                        paddingRight: 16,
                        opacity: 0.7,
                    }}
                />
            </ProfileField>

            {/* Sexo (read-only) */}
            <ReadOnlyRow label="Sexo" value={sexo} isDark={isDark} />

            {/* Fecha de nacimiento (read-only) */}
            <ReadOnlyRow
                label="Fecha de nacimiento"
                value={fechaNacimiento}
                isDark={isDark}
            />

            {/* Save button */}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Guardar cambios"
                className="flex-row items-center justify-center w-full h-12 rounded-full bg-sos-bluegreen active:opacity-90 mt-2"
                style={{
                    shadowColor: SOS_BLUEGREEN,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 4,
                }}
            >
                <MaterialIcons
                    name="save"
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                />
                <Text className="text-base font-poppins-bold text-sos-white">
                    Guardar cambios
                </Text>
            </Pressable>
        </View>
    );
}

// ─── Profile Field Wrapper ──────────────────────────────────
interface ProfileFieldProps {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isDark: boolean;
    badge?: string;
    children: React.ReactNode;
}

function ProfileField({
    label,
    icon,
    isDark,
    badge,
    children,
}: ProfileFieldProps) {
    return (
        <View style={{ gap: 6 }}>
            <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-900 font-poppins-bold dark:text-gray-200">
                    {label}
                </Text>
                {badge && (
                    <View
                        className="flex-row items-center"
                        style={{ gap: 4 }}
                    >
                        <MaterialIcons
                            name="check-circle"
                            size={14}
                            color="#22c55e"
                        />
                        <Text className="text-xs text-green-600 font-poppins-semibold dark:text-green-400">
                            {badge}
                        </Text>
                    </View>
                )}
            </View>
            <View className="relative">
                <View className="absolute top-0 bottom-0 left-4 z-10 justify-center">
                    <MaterialIcons name={icon} size={20} color="#9ca3af" />
                </View>
                {children}
            </View>
        </View>
    );
}

// ─── Read-Only Row ──────────────────────────────────────────
interface ReadOnlyRowProps {
    label: string;
    value: string;
    isDark: boolean;
}

function ReadOnlyRow({ label, value, isDark }: ReadOnlyRowProps) {
    return (
        <View
            className="pb-3"
            style={{
                borderBottomWidth: 1,
                borderBottomColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.05)",
            }}
        >
            <Text className="text-xs font-poppins-medium text-sos-gray dark:text-gray-500 mb-1 uppercase tracking-wide">
                {label}
            </Text>
            <Text className="text-base font-poppins-medium text-gray-900 dark:text-sos-white">
                {value}
            </Text>
        </View>
    );
}

// ─── Notificaciones Content ─────────────────────────────────
interface NotificacionesProps {
    isDark: boolean;
    notifCitas: boolean;
    setNotifCitas: (v: boolean) => void;
    notifBeneficios: boolean;
    setNotifBeneficios: (v: boolean) => void;
    notifGeneral: boolean;
    setNotifGeneral: (v: boolean) => void;
}

function NotificacionesContent({
    isDark,
    notifCitas,
    setNotifCitas,
    notifBeneficios,
    setNotifBeneficios,
    notifGeneral,
    setNotifGeneral,
}: NotificacionesProps) {
    return (
        <View className="pt-4" style={{ gap: 4 }}>
            <ToggleRow
                label="Recordatorios de citas"
                description="Recibe alertas antes de tus citas médicas"
                value={notifCitas}
                onToggle={() => setNotifCitas(!notifCitas)}
                isDark={isDark}
            />
            <ToggleRow
                label="Nuevos beneficios"
                description="Entérate de descuentos y promociones"
                value={notifBeneficios}
                onToggle={() => setNotifBeneficios(!notifBeneficios)}
                isDark={isDark}
            />
            <ToggleRow
                label="Comunicaciones generales"
                description="Noticias y actualizaciones de ClubSOS"
                value={notifGeneral}
                onToggle={() => setNotifGeneral(!notifGeneral)}
                isDark={isDark}
                isLast
            />
        </View>
    );
}

// ─── Toggle Row ─────────────────────────────────────────────
interface ToggleRowProps {
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    isDark: boolean;
    isLast?: boolean;
}

function ToggleRow({
    label,
    description,
    value,
    onToggle,
    isDark,
    isLast,
}: ToggleRowProps) {
    return (
        <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel={label}
            onPress={onToggle}
            className="flex-row items-center py-3.5"
            style={{
                gap: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.05)",
            }}
        >
            <View className="flex-1">
                <Text className="text-sm font-poppins-semibold text-gray-900 dark:text-sos-white">
                    {label}
                </Text>
                <Text className="text-xs font-sans text-sos-gray dark:text-gray-400 mt-0.5">
                    {description}
                </Text>
            </View>

            {/* Custom toggle */}
            <View
                className="w-11 h-6 rounded-full justify-center"
                style={{
                    backgroundColor: value
                        ? SOS_BLUEGREEN
                        : isDark
                          ? "#374151"
                          : "#d1d5db",
                    paddingHorizontal: 2,
                }}
            >
                <View
                    className="w-5 h-5 rounded-full bg-sos-white"
                    style={{
                        alignSelf: value ? "flex-end" : "flex-start",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                />
            </View>
        </Pressable>
    );
}

// ─── Parientes Content ──────────────────────────────────────
function ParientesContent({ isDark }: { isDark: boolean }) {
    // Mock parientes data
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
            <Text className="text-sm font-sans text-sos-gray dark:text-gray-400">
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
                    {/* Avatar circle */}
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

                    {/* Info */}
                    <View className="flex-1">
                        <Text className="text-sm font-poppins-semibold text-gray-900 dark:text-sos-white">
                            {p.nombre}
                        </Text>
                        <Text className="text-xs font-sans text-sos-gray dark:text-gray-400">
                            {p.parentesco}
                        </Text>
                    </View>

                    {/* Status */}
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

            {/* Add pariente button */}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Vincular nuevo pariente"
                className="flex-row items-center justify-center w-full py-3 rounded-xl active:opacity-80 mt-1"
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
}

// ─── Cerrar Sesión Content ──────────────────────────────────
function CerrarSesionContent({ isDark }: { isDark: boolean }) {
    return (
        <View className="pt-4" style={{ gap: 16 }}>
            <Text className="text-sm font-sans text-sos-gray dark:text-gray-400">
                Al cerrar sesión se eliminará tu información local. Podrás
                iniciar sesión nuevamente con tu número de teléfono.
            </Text>

            {/* Logout button */}
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
}
