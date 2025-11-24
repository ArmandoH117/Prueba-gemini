import './src/utils/notificationsSetup';
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";

export default function App() {
    const [fontsLoaded] = useFonts({
        Kuskatan: require("./assets/fonts/Kuskatan.ttf"),
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <AppNavigator />;
}
