import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function AuthHeader({ subtitle }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.logoBox}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>KUSKATAN</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBox: {
    width: 110,
    height: 110,
    backgroundColor: "#fff",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: "80%",
    height: "80%",
  },
  title: {
    fontSize: 30,
    color: colors.title,
    fontWeight: "700",
    fontFamily: "Kuskatan",
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 4,
    color: colors.info,
  },
});
