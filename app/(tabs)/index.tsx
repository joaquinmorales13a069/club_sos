import React from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BeneficioCard, { type Beneficio } from "@/components/BeneficioCard";
import CitaCard, { type Cita } from "@/components/CitaCard";
import MembresiaCard from "@/components/MembresiaCard";
import SupportButton from "@/components/SupportButton";

const miembro = {
  nombre_completo: "Joaquin Morales",
};

const empresa = {
  nombre_empresa: "SOS Medical",
};

const beneficiosMock: Beneficio[] = [
  {
    empresa_id: "empresa-001",
    titulo: "20% en Laboratorios Aliados",
    descripcion: "Aprovecha descuento en examenes de rutina durante este mes.",
    fecha_inicio: "2026-02-01T00:00:00.000Z",
    fecha_fin: "2026-02-28T23:59:59.000Z",
    estado_beneficio: "activo",
    creado_por: "admin",
    tipo_beneficio: "descuento",
  },
  {
    empresa_id: "empresa-001",
    titulo: "Paquete Preventivo Familiar",
    descripcion: "Promocion especial para chequeos medicos familiares.",
    fecha_inicio: "2026-02-10T00:00:00.000Z",
    fecha_fin: null,
    estado_beneficio: "activo",
    creado_por: "admin",
    tipo_beneficio: "promocion",
  },
  {
    empresa_id: "empresa-001",
    titulo: "Nueva sede disponible",
    descripcion: "Ahora puedes agendar en nuestra nueva sede del centro.",
    fecha_inicio: "2026-02-08T00:00:00.000Z",
    fecha_fin: null,
    estado_beneficio: "activo",
    creado_por: "admin",
    tipo_beneficio: "anuncio",
  },
  {
    empresa_id: "empresa-001",
    titulo: "15% en farmacia",
    descripcion: "Descuento inmediato en medicamentos seleccionados.",
    fecha_inicio: "2026-02-05T00:00:00.000Z",
    fecha_fin: "2026-03-05T00:00:00.000Z",
    estado_beneficio: "activo",
    creado_por: "admin",
    tipo_beneficio: "descuento",
  },
];

const citaMock: Cita = {
  miembro_id: "miembro-001",
  empresa_id: "empresa-001",
  fecha_hora_cita: new Date().toISOString(),
  motivo_cita: "Control general",
  ea_service_id: null,
  ea_provider_id: null,
  ea_customer_id: null,
  estado_sync: "pendiente",
  ea_appointment_id: null,
};

export default function HomeTabScreen() {
  const primerNombre = miembro.nombre_completo.trim().split(/\s+/)[0] ?? "Usuario";

  return (
    <SafeAreaView className="flex-1 bg-sos-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-4 pb-6">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-sos-bluegreen/10">
              <Image
                source={require("../../assets/images/GOTA.png")}
                accessibilityLabel="Icono de usuario ClubSOS"
                resizeMode="contain"
                className="h-7 w-7"
              />
            </View>

            <View className="flex-1">
              <Text className="text-2xl leading-tight text-gray-900 font-poppins-bold">
                Hola {primerNombre}
              </Text>
              <Text className="mt-1 text-sm leading-6 text-sos-gray">
                Bienvenido a ClubSOS. ¿En qué te podemos ayudar hoy?
              </Text>
            </View>
          </View>
        </View>

        <MembresiaCard
          estadoAfiliacion="Activo"
          mensaje="Tu salud está protegida"
          empresaNombre={empresa.nombre_empresa}
          afiliadoNombre={miembro.nombre_completo}
        />

        <View className="mt-7">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl text-gray-900 font-poppins-bold">Beneficios</Text>
            <Text className="text-sm text-sos-bluegreen font-poppins-medium">Ver todos</Text>
          </View>

          <View className="gap-3">
            {beneficiosMock.slice(0, 5).map((beneficio) => (
              <BeneficioCard key={beneficio.titulo} beneficio={beneficio} />
            ))}
          </View>
        </View>

        <View className="mt-7">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl text-gray-900 font-poppins-bold">Mis citas</Text>
            <Text className="text-sm text-sos-bluegreen font-poppins-medium">Ver todas</Text>
          </View>

          <CitaCard
            cita={citaMock}
            servicio="Consulta General"
            doctor="Dr. Maria Gonzalez"
          />
        </View>

        <View className="mt-6">
          <SupportButton onPress={() => Alert.alert("WhatsApp", "Abrir soporte por WhatsApp")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
