import { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useLanguageDetect } from "../hooks/useLanguageDetect";
import { makeRequest } from "../services/fetchRequest";

const memoryCache = new Map();

export default function TranslatableText({ text, keyText, styletext }) {
    const { detect, deviceLang } = useLanguageDetect();
    const [translated, setTranslated] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    const det = useMemo(() => detect(text), [text]);
    const source = det.source;
    const target = det.target;

    const canTranslate = source !== "und" && source !== deviceLang;

    async function handleTranslate() {
        const cached = memoryCache.get(keyText);

        if (cached) {
            setTranslated(cached);
            setShowOriginal(false);
            return;
        }
        
        setLoading(true);

        try {
            const infoTranslate = {
                text: text, 
                sourceLang: source, 
                targetLang: target
            }

            const response = await makeRequest('/ia/translate', { method: 'post' }, infoTranslate);
            setTranslated(response.translation);
            memoryCache.set(keyText, response.translation);
        } catch (error) {
            return "Ocurrió un error al procesar la solicitud.";
        } finally {
            setLoading(false);
        }
    }

    if (!canTranslate && !translated) {
        return <Text style={styletext || styles.messageText}>{text}</Text>;
    }

    return (
        <View>
            <Text style={styletext || styles.messageText}>
                {showOriginal || !translated ? text : translated}
            </Text>

            {loading ? (
                <View style={{ marginTop: 6 }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <View style={styles.translateView}>
                    {!translated && canTranslate && (
                        <Pressable onPress={handleTranslate} hitSlop={8}>
                            <Text style={[styletext, styles.tranlateText]}>Traducir</Text>
                        </Pressable>
                    )}

                    {translated && (
                        <>
                            <Pressable onPress={() => setShowOriginal(!showOriginal)} hitSlop={8}>
                                <Text style={[styletext, styles.tranlateText]}>
                                    {showOriginal ? "Ver traducción" : "Ver original"}
                                </Text>
                            </Pressable>
                            <Text style={{ color: "#6b7280" }}>
                                {`Mostrando ${showOriginal ? "original" : `traducido (${target})`}`}
                            </Text>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    messageText: {
        fontSize: 16,
        lineHeight: 22
    },
    tranlateText: {
        color: "#3b82f6",
        fontWeight: "600"
    },
    translateView: {
        flexDirection: "row",
        columnGap: 16,
        marginTop: 2
    }
});
