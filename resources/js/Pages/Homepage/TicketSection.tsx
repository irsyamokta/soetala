import { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import TicketCard from "@/Components/card/TicketCard";
import capitalizeFirst from "@/utils/capitalize";
import { formatCurrency } from "@/utils/formatCurrency";

function TicketSection() {
    const { locale, ticket }: any = usePage().props
    const t = useTranslate();
    const { translate } = useApiTranslate();

    const categoryMap: Record<string, string> = {
        adult: "Dewasa",
        child: "Anak",
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["ticket"], preserveUrl: true });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const [tickets, setTickets] = useState<any[]>(ticket || []);

    useEffect(() => {
        const doTranslate = async () => {
            if (!ticket) return;

            if (locale === "en") {
                const translated = await Promise.all(
                    ticket.map(async (t: any) => {
                        const reqArray = JSON.parse(t.requirement);

                        const translatedReq = await Promise.all(
                            reqArray.map((req: string) => translate(req, "en"))
                        );

                        return {
                            ...t,
                            category: await translate(t.category, "en"),
                            online_price: t.online_price,
                            offline_price: t.offline_price,
                            requirement: translatedReq,
                        };
                    })
                );
                setTickets(translated);
            } else {
                const localized = ticket.map((t: any) => ({
                    ...t,
                    category: categoryMap[t.category.toLowerCase()] || t.category,
                    requirement: JSON.parse(t.requirement),
                }));

                setTickets(localized);
            }
        };
        doTranslate();
    }, [locale, ticket]);

    return (
        <>
            {tickets.length > 0 && (
                <section className="flex flex-col items-center bg-primary text-white py-16 px-4 lg:px-20">
                    {/* Header */}
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="heading">{t("ticket.heading")}</h2>
                        <p className="subheading">
                            {t("ticket.subheading").split("\n").map((line, i) => (
                                <span key={i}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
                        {tickets.map((t, i) => (
                            <TicketCard
                                key={i}
                                title={capitalizeFirst(t.category)}
                                price={formatCurrency(t.online_price)}
                                requirement={Array.isArray(t.requirement)
                                    ? t.requirement.map((req: string, idx: number) => (
                                        <li style={{ listStyleType: "none" }} className="paragraph" key={idx}>{req}</li>
                                    ))
                                    : []}
                                otsPrice={formatCurrency(t.offline_price)}
                                href={route("checkout.index", { ticket_id: t.id })}
                            />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

export default TicketSection;
