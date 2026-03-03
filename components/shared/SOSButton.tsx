import React from "react";
import { Pressable, Text } from "react-native";

type SOSButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
};

export default function SOSButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel,
  accessibilityLabel,
}: SOSButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className={`w-full items-center justify-center h-14 rounded-xl bg-sos-red ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <Text className="text-lg leading-normal tracking-[0.015em] text-sos-white font-poppins-bold">
        {loading && loadingLabel ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
