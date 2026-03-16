import { Stack } from "expo-router";

export default function CitasFlowLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ubicacion" />
            <Stack.Screen name="servicio" />
        </Stack>
    );
}
