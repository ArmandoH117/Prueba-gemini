import { ActivityIndicator, View } from "react-native";

export default function Loader(loading) {
    return loading ? (
        <View style={{ paddingVertical: 10 }}>
            <ActivityIndicator />
        </View>
    ) : null;
};
