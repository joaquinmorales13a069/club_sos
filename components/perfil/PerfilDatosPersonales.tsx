import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ProfileField from "@/components/perfil/ProfileField";
import ReadOnlyRow from "@/components/perfil/ReadOnlyRow";
import type { DatosPersonalesProps } from "@/type";

const SOS_BLUEGREEN = "#0066CC";

const PerfilDatosPersonales = React.memo(function PerfilDatosPersonales({
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

            <ReadOnlyRow label="Sexo" value={sexo} isDark={isDark} />

            <ReadOnlyRow
                label="Fecha de nacimiento"
                value={fechaNacimiento}
                isDark={isDark}
            />

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Guardar cambios"
                className="flex-row items-center justify-center w-full h-12 mt-2 rounded-full bg-sos-bluegreen active:opacity-90"
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
});

export default PerfilDatosPersonales;
