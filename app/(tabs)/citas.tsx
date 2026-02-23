import React from "react";
import { Text, View } from "react-native";

import TabScreenView from "@/components/TabScreenView";

export default function CitasTabScreen() {
  return (
    <TabScreenView className="flex-1 bg-sos-white">
      <View className="flex-1 px-4 pt-6">
        <Text className="text-2xl text-gray-900 font-poppins-bold">Mis citas</Text>
        <View className="mt-4 rounded-2xl border border-gray-100 bg-sos-white p-5 shadow-sm">
          <Text className="text-base text-sos-gray">
            Aqui veras todas tus citas programadas.
          </Text>
        </View>
      </View>
    </TabScreenView>
  );
}
