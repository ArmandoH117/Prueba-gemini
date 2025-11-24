import { franc } from "franc-min";
import * as Localization from "expo-localization";
import { iso3to1 } from "../utils/lang";

export function useLanguageDetect() {
    const deviceLang = (Localization.locale || "es").split("-")[0].toLowerCase();

    function detect(text) {
        if (!text || text.trim().length < 5) return { source: "und", target: deviceLang };
        const iso3 = franc(text, { minLength: 5 });
        const source = iso3 === "und" ? "und" : (iso3to1(iso3) || "und");
        return { source, target: deviceLang };
    }
    return { detect, deviceLang };
}
