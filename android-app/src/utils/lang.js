
const ISO3_TO_1 = {
    spa: "es", eng: "en", fra: "fr", deu: "de",
    ita: "it", jpn: "ja", kor: "ko", rus: "ru", hin: "hi",
};

export function iso3to1(iso3) {
    if (!iso3) return null;
    return ISO3_TO_1[iso3] || null;
}
