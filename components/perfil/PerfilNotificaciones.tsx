import React from "react";
import { View } from "react-native";
import ToggleRow from "@/components/perfil/ToggleRow";
import type { NotificacionesProps } from "@/type";

const PerfilNotificaciones = React.memo(function PerfilNotificaciones({
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
});

export default PerfilNotificaciones;
