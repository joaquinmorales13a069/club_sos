import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login-phone" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="verify-company" />
      <Stack.Screen name="verify-account-type" />
      <Stack.Screen name="link-main-account" />
      <Stack.Screen name="verify-account-info" />
    </Stack>
  );
}

