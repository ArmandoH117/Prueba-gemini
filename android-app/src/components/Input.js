import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export default function Input({
  label,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        {leftIcon ? (
          <Ionicons name={leftIcon} size={20} color={colors.info} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={[styles.input, style, leftIcon ? { paddingLeft: 34 } : null, rightIcon ? { paddingRight: 36 } : null]}
          placeholderTextColor={colors.info}
          {...props}
        />
        {rightIcon ? (
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.info}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 4,
    color: colors.title,
    fontWeight: "600",
  },
  inputRow: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E3E6EF",
    fontSize: 15,
    color: colors.title,
  },
  leftIcon: {
    position: "absolute",
    left: 10,
    zIndex: 2,
  },
  rightIcon: {
    position: "absolute",
    right: 10,
    zIndex: 2,
  },
});
