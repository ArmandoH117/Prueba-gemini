import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ComposerBtn({ icon, label, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#e5e7eb' }}>
            <Ionicons name={icon} size={18} />
            <Text>{label}</Text>
        </TouchableOpacity>
    );
}