import { useEffect, useState } from "react";
import useTranslate from "@/hooks/useTranslate";
import DOMPurify from "dompurify";
import parse from "html-react-parser";


export default function Description({ description, maxLength = 120, lang, translate }: {
    description?: string;
    maxLength?: number;
    lang: "id" | "en";
    translate: (text: string, target: "id" | "en") => Promise<string>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [translatedDesc, setTranslatedDesc] = useState<string>("");

    const t = useTranslate();

    useEffect(() => {
        const doTranslate = async () => {
            if (!description) return;

            const cleanHtml = DOMPurify.sanitize(description);
            const textOnly = cleanHtml.replace(/<[^>]+>/g, "");

            if (lang === "en") {
                const translated = await translate(textOnly, "en");
                console.log("Translated to EN:", translated);
                setTranslatedDesc(translated);
            } else if (lang === "id") {
                setTranslatedDesc(textOnly);
            }
        };

        doTranslate();
    }, [description, lang, translate]);

    if (!translatedDesc) return null;

    const shouldTruncate = translatedDesc.length > maxLength;
    const displayedText = expanded || !shouldTruncate
        ? translatedDesc
        : translatedDesc.slice(0, maxLength) + "...";

    return (
        <div className="text-sm text-gray-600 mt-2">
            <div>{parse(DOMPurify.sanitize(displayedText))}</div>
            {shouldTruncate && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary font-semibold text-xs mt-1"
                >
                    {expanded ? (t("ticket.close")) : (t("ticket.readmore"))}
                </button>
            )}
        </div>
    );
}
