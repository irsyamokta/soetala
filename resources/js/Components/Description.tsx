import { useEffect, useState } from "react";
import useTranslate from "@/hooks/useTranslate";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

export default function Description({
    description,
    maxLength = 220,
    lang,
    translate,
}: {
    description?: string;
    maxLength?: number;
    lang: "id" | "en";
    translate: (text: string, target: "id" | "en") => Promise<string>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [translatedDesc, setTranslatedDesc] = useState<string>("");

    const t = useTranslate();

    const extractTextNodes = (html: string): { text: string; structure: string } => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        let textContent = "";

        const traverse = (node: Node): string => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent || "";
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const tag = element.tagName.toLowerCase();
                const attributes = Array.from(element.attributes)
                    .map((attr) => `${attr.name}="${attr.value}"`)
                    .join(" ");
                const children = Array.from(node.childNodes)
                    .map((child) => traverse(child))
                    .join("");
                return `<${tag}${attributes ? " " + attributes : ""}>${children}</${tag}>`;
            }
            return "";
        };

        const structure = traverse(doc.body);

        const walk = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                textContent += (node.textContent || "") + " ";
            } else {
                node.childNodes.forEach((child) => walk(child));
            }
        };
        walk(doc.body);

        return { text: textContent.trim(), structure };
    };

    const replaceTextInHtml = (structure: string, translatedText: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(structure, "text/html");
        const textNodes = translatedText.split(/\s+/);
        let textIndex = 0;

        const traverse = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                if (textIndex < textNodes.length) {
                    node.textContent = textNodes[textIndex++];
                }
            } else {
                node.childNodes.forEach((child) => traverse(child));
            }
        };

        traverse(doc.body);
        return doc.body.innerHTML;
    };

    useEffect(() => {
        let isMounted = true;

        const doTranslate = async () => {
            if (!description) {
                if (isMounted) setTranslatedDesc("");
                return;
            }

            const cleanHtml = DOMPurify.sanitize(description, {
                ALLOWED_TAGS: ["p", "b", "i", "strong", "em"],
            });

            if (lang === "en") {
                const { text, structure } = extractTextNodes(cleanHtml);
                if (text) {
                    const translatedText = await translate(text, "en");
                    const reconstructedHtml = replaceTextInHtml(structure, translatedText);
                    if (isMounted) setTranslatedDesc(reconstructedHtml);
                } else {
                    if (isMounted) setTranslatedDesc(cleanHtml);
                }
            } else {
                if (isMounted) setTranslatedDesc(cleanHtml);
            }
        };

        doTranslate();

        return () => {
            isMounted = false;
        };
    }, [description, lang, translate]);

    if (!translatedDesc) return null;

    const plainText = translatedDesc.replace(/<[^>]+>/g, "").trim();
    const shouldTruncate = plainText.length > maxLength;

    const displayedText =
        expanded || !shouldTruncate
            ? translatedDesc
            : `${translatedDesc.slice(0, maxLength)}...`;

    return (
        <div className="text-sm text-gray-600 mt-2">
            <div>{parse(DOMPurify.sanitize(displayedText))}</div>
            {shouldTruncate && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary font-semibold text-xs mt-1"
                >
                    {expanded ? t("ticket.close") : t("ticket.readmore")}
                </button>
            )}
        </div>
    );
}
