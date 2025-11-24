import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { ActiveChatProvider } from "../contexts/ActiveChatContext";
import NotificationListener from "../services/NotificationListener";
import FriendsScreen from "../screens/FriendsScreen";
import ChatsScreen from "../screens/ChatsScreen";
import ChatScreen from "../screens/ChatScreen";
import SuggestionsScreen from "../screens/SuggestionsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import { AuthProvider } from "../contexts/AuthContext";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import { createRef } from "react";
import EditProfileScreen from "../screens/EditProfileScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const homeScrollRef = createRef();

function ChatStack() {
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
            <Stack.Screen name="Perfil" component={ProfileScreen} />
        </Stack.Navigator>
    );
}

function HomeStack({ userId }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen
                name="Perfil"
                component={ProfileScreen}
                initialParams={{ idUsuario: userId }}
            />
        </Stack.Navigator>
    )
}

function SettingsStack({ setUser }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Settings">
                {(props) => <SettingsScreen {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
    )
}

export default function AppTabs({ setUser, userId }) {

    return (
        <AuthProvider>
            <ActiveChatProvider>
                <NotificationListener />
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarActiveTintColor: colors.accent,
                        tabBarIcon: ({ color, size, focused }) => {
                            let iconName = "home-outline";

                            if (route.name === "Home") {
                                iconName = focused ? "home" : "home-outline";
                            } else if (route.name === "Friends") {
                                iconName = focused ? "people" : "people-outline";
                            } else if (route.name === "Chats") {
                                iconName = focused ? "chatbubbles" : "chatbubbles-outline";
                            } else if (route.name === "Ajustes") {
                                iconName = focused ? "settings" : "settings-outline";
                            }

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                    })}
                >
                    <Tab.Screen
                        name="Home"
                        listeners={({ navigation }) => ({
                            tabPress: (e) => {
                                const isFocused = navigation.isFocused();
                                if (isFocused && homeScrollRef.current) {
                                    homeScrollRef.current.scrollToOffset({
                                        offset: 0,
                                        animated: true
                                    });
                                }
                            },
                        })}
                    >
                        {() => <HomeStack userId={userId} />}
                    </Tab.Screen>
                    <Tab.Screen name="Friends" component={FriendsStack} />
                    <Tab.Screen name="Chats" component={ChatStack} />
                    <Tab.Screen name="Ajustes">
                        {(props) => <SettingsStack {...props} setUser={setUser} />}
                    </Tab.Screen>
                </Tab.Navigator>
            </ActiveChatProvider>
        </AuthProvider>
    );
}