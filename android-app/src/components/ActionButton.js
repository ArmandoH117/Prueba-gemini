
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ActionButton({ label, icon, onPress, active, textColor, muted }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Ionicons name={icon} size={18} color={active ? '#ef4444' : muted} />
            <Text style={{ color: active ? '#ef4444' : textColor, fontWeight: '600' }}>{label}</Text>
        </TouchableOpacity>
    );
}