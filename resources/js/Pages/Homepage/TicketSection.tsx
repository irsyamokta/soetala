import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import TicketCard from "@/Components/card/TicketCard";

function TicketSection() {
    const t = useTranslate();
    const { locale }: any = usePage().props;
    const { translate } = useApiTranslate();

    const baseTickets = [
        {
            title: "Dewasa",
            price: "Rp36.000",
            description: [
                "Berlaku untuk pengunjung usia 12 tahun ke atas. Lebih hemat dengan pembelian online.",
                "Tiket berlaku hanya untuk satu kali kunjungan",
            ],
            otsPrice: "Rp50.000",
            href: "/checkout/dewasa",
        },
        {
            title: "Anak",
            price: "Rp18.500",
            description: [
                "Berlaku untuk anak usia 3–11 tahun. Gratis untuk anak di bawah 3 tahun.",
                "Tiket berlaku hanya untuk satu kali kunjungan",
            ],
            otsPrice: "Rp24.000",
            href: "/checkout/anak",
        },
    ];

    const [tickets, setTickets] = useState(baseTickets);

    useEffect(() => {
        const doTranslate = async () => {
            if (locale === "en") {
                const translated = await Promise.all(
                    baseTickets.map(async (ticket) => ({
                        ...ticket,
                        title: await translate(ticket.title, "en"),
                        description: await Promise.all(
                            ticket.description.map((d) => translate(d, "en"))
                        ),
                    }))
                );
                setTickets(translated);
            } else {
                setTickets(baseTickets);
            }
        };
        doTranslate();
    }, [locale]);

    return (
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
                {tickets.map((ticket, i) => (
                    <TicketCard
                        key={i}
                        title={ticket.title}
                        price={ticket.price}
                        description={ticket.description}
                        otsPrice={ticket.otsPrice}
                        href={ticket.href}
                    />
                ))}
            </div>
        </section>
    );
}

export default TicketSection;
