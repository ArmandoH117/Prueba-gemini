import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function PrimaryButton({ title, onPress, style, textStyle, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        style,
        disabled ? { opacity: 0.6 } : null,
      ]}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  text: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});
