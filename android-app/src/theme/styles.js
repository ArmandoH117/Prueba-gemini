import { StyleSheet } from "react-native";

export const stylesPost = StyleSheet.create({
    card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginHorizontal: 10, marginTop: 10, padding: 12 },
    cardNoMargin: { padding: 2, borderTopColor: "#e5e7eb", borderTopWidth: 1, paddingTop: 12, borderTopLeftRadius: 12 },
    publicandoText: { fontSize: 13, color: '#4a4a4aff', marginBottom: 15, borderBottomColor: "#f5f5f5", borderBottomWidth: 2, paddingBottom:5 },
    postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },postImage: { width: '100%', height: 260, borderRadius: 8, marginTop: 6 },
    postImage: { width: '100%', height: 260, borderRadius: 8, marginTop: 6 },
    countsRow: { paddingVertical: 8, borderTopWidth: 1, borderColor: '#e5e7eb' },
    actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e5e7eb' },
    commentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
    commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ccc' },
    commentAvatarSmall: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ccc', marginTop: 2 },
    commentInput: { flex: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
});

export const stylesMediaPost = StyleSheet.create({
    viewerImage: { width: '100%', height: '100%' },
    viewerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', alignItems: 'center', justifyContent: 'center' },
    topBtn: { marginHorizontal: 6, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 20, zIndex: 1000 },
});