import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    // TODO: Implement sign-in logic
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Background decor */}
      <View className="absolute top-0 left-0 w-full h-[50%] bg-primary/5 pointer-events-none" />
      <View className="absolute -top-24 -right-24 w-64 h-64 bg-sos-blue/10 rounded-full pointer-events-none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="relative z-10 flex flex-col flex-1 max-w-md mx-auto w-full px-6 pt-8 pb-6">
            {/* Branding / Header */}
            <View className="flex flex-col items-center justify-center pt-8 pb-6">
              <View className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={32}
                  color="#CD2129"
                />
              </View>
              <Text className="text-sm font-bold tracking-widest text-primary uppercase mb-1 font-display">
                Club SOS
              </Text>
              <Text className="text-3xl font-bold text-gray-900 text-center leading-tight font-display">
                Bienvenido
              </Text>
              <Text className="text-sos-gray text-center mt-2 text-sm font-display">
                Ingresa tus datos para acceder a tus beneficios médicos.
              </Text>
            </View>

            {/* Form */}
            <View className="flex flex-col gap-5 mt-4">
              {/* Email */}
              <View className="flex flex-col gap-2">
                <Text className="text-sm font-semibold text-gray-900 ml-1 font-display">
                  Correo electrónico
                </Text>
                <View className="relative flex-row items-center border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
                  <View className="absolute left-4 z-10">
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={22}
                      color="#9ca3af"
                    />
                  </View>
                  <TextInput
                    className="flex-1 pl-12 pr-4 py-4 text-gray-900 font-display text-base"
                    placeholder="nombre@ejemplo.com"
                    placeholderTextColor="#616161"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password */}
              <View className="flex flex-col gap-2">
                <Text className="text-sm font-semibold text-gray-900 ml-1 font-display">
                  Contraseña
                </Text>
                <View className="relative flex-row items-center border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
                  <View className="absolute left-4 z-10">
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={22}
                      color="#9ca3af"
                    />
                  </View>
                  <TextInput
                    className="flex-1 pl-12 pr-12 py-4 text-gray-900 font-display text-base"
                    placeholder="••••••••"
                    placeholderTextColor="#616161"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <Pressable
                    className="absolute right-4 z-10 p-1"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Forgot password */}
              <View className="flex justify-end">
                <Pressable>
                  <Text className="text-sm font-medium text-sos-blue font-display">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </Pressable>
              </View>

              {/* Primary button */}
              <Pressable
                className="mt-4 w-full bg-primary active:opacity-90 rounded-xl py-4 px-6 flex flex-row items-center justify-center gap-2 shadow-sm"
                onPress={handleSubmit}
                style={{
                  shadowColor: "#CD2129",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.39,
                  shadowRadius: 14,
                  elevation: 4,
                }}
              >
                <Text className="text-white font-bold text-base font-display">
                  Iniciar Sesión
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="white"
                />
              </Pressable>
            </View>

            {/* Divider */}
            <View className="relative py-8">
              <View className="absolute inset-0 flex justify-center">
                <View className="w-full border-t border-gray-100" />
              </View>
              <View className="relative flex justify-center">
                <View className="px-4 bg-background-light">
                  <Text className="text-sm text-gray-400 font-display">
                    O continúa con
                  </Text>
                </View>
              </View>
            </View>

            {/* Social login */}
            <View className="flex flex-row gap-4 mb-8">
              <Pressable className="flex-1 flex flex-row items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl active:bg-gray-50">
                <Image
                  source={{
                    uri: "https://www.google.com/favicon.ico",
                  }}
                  className="w-5 h-5"
                  style={{ width: 20, height: 20 }}
                />
                <Text className="text-sm font-medium text-gray-700 font-display">
                  Google
                </Text>
              </Pressable>
              <Pressable className="flex-1 flex flex-row items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl active:bg-gray-50">
                <MaterialCommunityIcons
                  name="apple"
                  size={20}
                  color="#171717"
                />
                <Text className="text-sm font-medium text-gray-700 font-display">
                  Apple
                </Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View className="mt-auto pt-4 pb-6">
              <Text className="text-base text-gray-600 text-center font-display">
                ¿No tienes una cuenta?{" "}
                <Pressable onPress={() => router.push("/signup")}>
                  <Text className="font-bold text-primary font-display">
                    Regístrate
                  </Text>
                </Pressable>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
