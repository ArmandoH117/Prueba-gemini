import { Image, TouchableOpacity, View, Text } from "react-native";
import { StyleSheet } from "react-native";


export default function PostImagesGrid({ images, onPressIndex }) {
    const n = images.length;
    if (n === 1) {
        return (
            <TouchableOpacity onPress={() => onPressIndex?.(0)}>
                <Image source={{ uri: images[0] }} style={{ width: '100%', height: 260, borderRadius: 8, marginTop: 6 }} />
            </TouchableOpacity>
        );
    }

    const renderCell = (uri, i) => (
        <TouchableOpacity key={i} style={{ flex: 1, aspectRatio: 1, margin: 2 }} onPress={() => onPressIndex?.(i)}>
            <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
            {i === 3 && n > 4 && (
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 24 }}>+{n - 4}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const firstFour = images.slice(0, 4);

    return (
        <View style={{ marginTop: 6 }}>
            {n === 2 ? (
                <View style={{ flexDirection: 'row' }}>{firstFour.map(renderCell)}</View>
            ) : (
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        {renderCell(firstFour[0], 0)}
                        {renderCell(firstFour[1] || firstFour[0], 1)}
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        {firstFour[2] && renderCell(firstFour[2], 2)}
                        {firstFour[3] && renderCell(firstFour[3], 3)}
                    </View>
                </View>
            )}
        </View>
    );
}