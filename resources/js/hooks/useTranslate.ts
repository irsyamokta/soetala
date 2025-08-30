import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function useTranslate() {
    const { translations } = usePage<PageProps<{ translations: Record<string, string> }>>().props;

    return (key: string) => translations[key] || key;
}
