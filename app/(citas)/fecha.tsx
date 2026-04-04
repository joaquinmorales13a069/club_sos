import React, { useState } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import TopAppBar from "@/components/auth/TopAppBar";
import SOSButton from "@/components/shared/SOSButton";
import { THEME_COLORS } from "@/libs/themeColors";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toLocalDateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const diasEnMes = (year: number, month: number): number =>
    new Date(year, month + 1, 0).getDate();

const primerDiaSemana = (year: number, month: number): number => {
    const jsDay = new Date(year, month, 1).getDay();
    return (jsDay + 6) % 7;
};

// ─── Calendario ───────────────────────────────────────────────────────────────

interface CalendarioMesProps {
    year: number;
    month: number;
    selected: string | null;
    minFecha: string;
    maxFecha: string;
    isDark: boolean;
    onSelectDia: (fecha: string) => void;
    onPrevMes: () => void;
    onNextMes: () => void;
    puedeRetroceder: boolean;
    puedeAvanzar: boolean;
}

function CalendarioMes({
    year,
    month,
    selected,
    minFecha,
    maxFecha,
    isDark,
    onSelectDia,
    onPrevMes,
    onNextMes,
    puedeRetroceder,
    puedeAvanzar,
}: CalendarioMesProps) {
    const totalDias = diasEnMes(year, month);
    const offset = primerDiaSemana(year, month);

    const celdas: (number | null)[] = [
        ...Array(offset).fill(null),
        ...Array.from({ length: totalDias }, (_, i) => i + 1),
    ];

    while (celdas.length % 7 !== 0) celdas.push(null);

    return (
        <View>
            {/* Encabezado mes/año */}
            <View className="flex-row justify-between items-center mb-4">
                <Pressable
                    onPress={onPrevMes}
                    disabled={!puedeRetroceder}
                    accessibilityRole="button"
                    accessibilityLabel="Mes anterior"
                    className={`p-2 rounded-xl ${!puedeRetroceder ? "opacity-30" : "active:opacity-60"}`}
                >
                    <MaterialIcons name="chevron-left" size={24} color={THEME_COLORS.sosBluegreen} />
                </Pressable>

                <Text className="text-base text-gray-900 dark:text-sos-white font-poppins-bold">
                    {MESES[month]} {year}
                </Text>

                <Pressable
                    onPress={onNextMes}
                    disabled={!puedeAvanzar}
                    accessibilityRole="button"
                    accessibilityLabel="Mes siguiente"
                    className={`p-2 rounded-xl ${!puedeAvanzar ? "opacity-30" : "active:opacity-60"}`}
                >
                    <MaterialIcons name="chevron-right" size={24} color={THEME_COLORS.sosBluegreen} />
                </Pressable>
            </View>

            {/* Nombres de días */}
            <View className="flex-row mb-2">
                {DIAS_SEMANA.map((dia) => (
                    <View key={dia} className="flex-1 items-center">
                        <Text className="text-xs uppercase text-sos-gray dark:text-gray-400 font-poppins-semibold">
                            {dia}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Grid de días */}
            {Array.from({ length: celdas.length / 7 }, (_, fila) => (
                <View key={fila} className="flex-row mb-1">
                    {celdas.slice(fila * 7, fila * 7 + 7).map((dia, col) => {
                        if (dia === null) {
                            return <View key={col} className="flex-1" />;
                        }

                        const fechaStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                        const esDomingo = (offset + dia - 1) % 7 === 6;
                        const fueradeRango = fechaStr < minFecha || fechaStr > maxFecha;
                        const deshabilitado = esDomingo || fueradeRango;
                        const esSeleccionado = fechaStr === selected;

                        const textColor = esSeleccionado
                            ? "text-sos-white"
                            : deshabilitado
                              ? isDark ? "text-gray-600" : "text-gray-300"
                              : isDark ? "text-gray-100" : "text-gray-800";

                        return (
                            <Pressable
                                key={col}
                                onPress={() => !deshabilitado && onSelectDia(fechaStr)}
                                disabled={deshabilitado}
                                accessibilityRole="button"
                                accessibilityLabel={`${dia} de ${MESES[month]}`}
                                accessibilityState={{ selected: esSeleccionado, disabled: deshabilitado }}
                                className="flex-1 items-center py-1"
                            >
                                <View
                                    style={
                                        esSeleccionado
                                            ? { backgroundColor: THEME_COLORS.sosBluegreen }
                                            : undefined
                                    }
                                    className="justify-center items-center w-9 h-9 rounded-full"
                                >
                                    <Text className={`text-sm font-poppins-medium ${textColor}`}>
                                        {dia}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FechaScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const {
        categoriaId,
        ubicacionNombre,
        eaServiceId,
        servicioNombre,
        servicioDuracion,
        eaProviderId,
        doctorNombre,
    } = useLocalSearchParams<{
        categoriaId: string;
        ubicacionNombre: string;
        eaServiceId: string;
        servicioNombre: string;
        servicioDuracion: string;
        eaProviderId: string;
        doctorNombre: string;
    }>();

    const ahora = new Date();

    // Mínimo: 24 horas desde ahora
    const cutoff24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const minFecha = toLocalDateString(cutoff24h);

    // Máximo: 3 meses desde hoy
    const maxDate = new Date(ahora);
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxFecha = toLocalDateString(maxDate);

    const [year, setYear] = useState(ahora.getFullYear());
    const [month, setMonth] = useState(ahora.getMonth());
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

    const mesActualYear = ahora.getFullYear();
    const mesActualMonth = ahora.getMonth();
    const puedeRetroceder =
        year > mesActualYear || (year === mesActualYear && month > mesActualMonth);
    const puedeAvanzar =
        year < maxDate.getFullYear() || (year === maxDate.getFullYear() && month < maxDate.getMonth());

    const handlePrevMes = () => {
        if (month === 0) { setYear((y) => y - 1); setMonth(11); }
        else { setMonth((m) => m - 1); }
    };

    const handleNextMes = () => {
        if (month === 11) { setYear((y) => y + 1); setMonth(0); }
        else { setMonth((m) => m + 1); }
    };

    const handleContinuar = () => {
        if (!fechaSeleccionada) return;
        router.push({
            pathname: "/(citas)/horario",
            params: {
                categoriaId,
                ubicacionNombre,
                eaServiceId,
                servicioNombre,
                servicioDuracion,
                eaProviderId,
                doctorNombre,
                fecha: fechaSeleccionada,
            },
        });
    };

    const fechaLegible = fechaSeleccionada
        ? new Intl.DateTimeFormat("es-NI", {
              weekday: "long",
              day: "numeric",
              month: "long",
          }).format(new Date(fechaSeleccionada + "T12:00:00"))
        : null;

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={4}
                totalSteps={7}
            />

            <View className="flex-1 px-4">
                {/* Título */}
                <Text className="pt-2 text-3xl tracking-tight leading-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Selecciona la fecha
                </Text>

                {/* Resumen de selecciones previas */}
                <View className="flex-row flex-wrap gap-3 mt-2 mb-6">
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="location-on" size={13} color={THEME_COLORS.sosBluegreen} />
                        <Text className="text-xs text-sos-bluegreen font-poppins-medium">
                            {ubicacionNombre}
                        </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="medical-services" size={13} color={isDark ? "#9CA3AF" : THEME_COLORS.sosGray} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                            {servicioNombre}
                        </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="person" size={13} color={isDark ? "#9CA3AF" : THEME_COLORS.sosGray} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                            {doctorNombre}
                        </Text>
                    </View>
                </View>

                {/* Nota domingos */}
                <View className="flex-row gap-2 items-center px-3 py-2 mb-4 bg-amber-50 rounded-xl border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50">
                    <MaterialIcons name="info-outline" size={15} color="#D97706" />
                    <Text className="flex-1 text-xs text-amber-700 dark:text-amber-400 font-poppins-medium">
                        Las citas deben agendarse con al menos 24 horas de antelación y hasta 3 meses en adelante. No se atiende los domingos.
                    </Text>
                </View>

                {/* Calendario */}
                <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] p-4 shadow-sm">
                    <CalendarioMes
                        year={year}
                        month={month}
                        selected={fechaSeleccionada}
                        minFecha={minFecha}
                        maxFecha={maxFecha}
                        isDark={isDark}
                        onSelectDia={setFechaSeleccionada}
                        onPrevMes={handlePrevMes}
                        onNextMes={handleNextMes}
                        puedeRetroceder={puedeRetroceder}
                        puedeAvanzar={puedeAvanzar}
                    />
                </View>

                {/* Botón continuar */}
                <View className="py-6 mt-auto">
                    {fechaLegible && (
                        <Text className="mb-3 text-sm text-center capitalize text-sos-bluegreen dark:text-sos-white font-poppins-medium">
                            {fechaLegible}
                        </Text>
                    )}
                    <SOSButton
                        label="Ver horarios disponibles"
                        onPress={handleContinuar}
                        disabled={!fechaSeleccionada}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
