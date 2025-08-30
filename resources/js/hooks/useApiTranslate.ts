import { useState, useRef } from "react";
import axios from "axios";

export default function useApiTranslate() {
    const [loading, setLoading] = useState(false);
    const cache = useRef<Map<string, string>>(new Map());

    const translate = async (text: string, to: string = "en") => {
        const key = `${text}_${to}`;

        if (cache.current.has(key)) {
            return cache.current.get(key);
        }

        const localCache = localStorage.getItem("translationCache");
        const parsedCache = localCache ? JSON.parse(localCache) : {};
        if (parsedCache[key]) {
            cache.current.set(key, parsedCache[key]);
            return parsedCache[key];
        }

        try {
            setLoading(true);

            const res = await axios.get(
                import.meta.env.VITE_TRANSLATE_API,
                {
                    params: {
                        string: text,
                        to_lang: to,
                    },
                }
            );

            const translated = res.data;

            cache.current.set(key, translated);

            const updatedCache = { ...parsedCache, [key]: translated };
            localStorage.setItem("translationCache", JSON.stringify(updatedCache));

            return translated;
        } catch (e) {
            console.error("Translate error:", e);
            return text;
        } finally {
            setLoading(false);
        }
    };

    return { translate, loading };
}
