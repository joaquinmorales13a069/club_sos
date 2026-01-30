import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative z-10 max-w-md mx-auto w-full px-6 pt-8 pb-6">
          {/* Header */}
          <View className="flex flex-col items-center justify-center pt-8 pb-6">
            <Text className="text-sm font-bold tracking-widest text-primary uppercase mb-1 font-display">
              Club SOS
            </Text>
            <Text className="text-3xl font-bold text-gray-900 text-center leading-tight font-display">
              Crear cuenta
            </Text>
            <Text className="text-sos-gray text-center mt-2 text-sm font-display">
              Completa tus datos para registrarte.
            </Text>
          </View>

          {/* Form */}
          <View className="flex flex-col gap-5 mt-4">
            <View className="flex flex-col gap-2">
              <Text className="text-sm font-semibold text-gray-900 ml-1 font-display">
                Correo electrónico
              </Text>
              <TextInput
                className="w-full pl-4 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-display text-base"
                placeholder="nombre@ejemplo.com"
                placeholderTextColor="#616161"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View className="flex flex-col gap-2">
              <Text className="text-sm font-semibold text-gray-900 ml-1 font-display">
                Contraseña
              </Text>
              <TextInput
                className="w-full pl-4 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-display text-base"
                placeholder="••••••••"
                placeholderTextColor="#616161"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
            <View className="flex flex-col gap-2">
              <Text className="text-sm font-semibold text-gray-900 ml-1 font-display">
                Confirmar contraseña
              </Text>
              <TextInput
                className="w-full pl-4 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-display text-base"
                placeholder="••••••••"
                placeholderTextColor="#616161"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Pressable
              className="mt-4 w-full bg-primary active:opacity-90 rounded-xl py-4 px-6 flex flex-row items-center justify-center gap-2"
              onPress={() => {}}
            >
              <Text className="text-white font-bold text-base font-display">
                Registrarse
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-8 text-center">
            <Text className="text-base text-gray-600 font-display">
              ¿Ya tienes una cuenta?{" "}
              <Pressable onPress={() => router.push("/signin")}>
                <Text className="font-bold text-primary font-display">
                  Iniciar sesión
                </Text>
              </Pressable>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
