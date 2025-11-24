import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import { colors } from "../theme/colors";
import EditProfileScreen from "../screens/EditProfileScreen";
import { getData } from "../utils/LocalStorage";

const Stack = createNativeStackNavigator();

// Stack SOLO para cuando el usuario ya está logueado
function LoggedInStack({ setUser, userId }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tus tabs de siempre */}
      <Stack.Screen name="AppTabs">
        {(props) => <AppTabs {...props} setUser={setUser} userId={userId} />}
      </Stack.Screen>

      {/* Nueva pantalla de Editar perfil */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      await getData("idUser", setUser);
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent || "#7D5AF2"} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <LoggedInStack setUser={setUser} userId={user} />
      ) : (
        <AuthStack setUser={setUser} />
      )}
    </NavigationContainer>
  );
}
