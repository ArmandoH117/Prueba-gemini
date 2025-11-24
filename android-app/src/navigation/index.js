import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatsScreen from "../screens/ChatsScreen";
import ChatScreen from "../screens/ChatScreen";
import HomeScreen from "../screens/HomeScreen";
import { ActiveChatProvider } from "../contexts/ActiveChatContext";
import NotificationListener from "../services/NotificationListener";
import FriendsScreen from "../screens/FriendsScreen";
import SuggestionsScreen from "../screens/SuggestionsScreen";
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from "../screens/SettingsScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chats" component={ChatsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function FriendsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="suggestions" component={SuggestionsScreen} />
      <Stack.Screen name="friends" component={FriendsScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Friends") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "ChatsTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },


        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen name="Friends" component={FriendsStack} options={{ title: "Amigos" }} />
      <Tab.Screen name="ChatsTab" component={ChatsStack} options={{ title: "Chats" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Configuración" }} />
    </Tab.Navigator>
  );
}


export default function Navigation() {
  return (
    <NavigationContainer>
      <ActiveChatProvider>
        <NotificationListener />
        <MainTabs />
      </ActiveChatProvider>
    </NavigationContainer>
  );
}
