import useTranslate from "@/hooks/useTranslate";
import TicketCard from "@/Components/card/TicketCard";
import { Head } from "@inertiajs/react";

function TicketSection() {
    const t = useTranslate();

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
                {/* Tiket Dewasa */}
                <TicketCard
                    title="Dewasa"
                    price="Rp36.000"
                    description={[
                        "Berlaku untuk pengunjung usia 12 tahun ke atas. Lebih hemat dengan pembelian online.",
                        "Tiket berlaku hanya untuk satu kali kunjungan",
                    ]}
                    otsPrice="Rp50.000"
                    href="/checkout/dewasa"
                />

                {/* Tiket Anak */}
                <TicketCard
                    title="Anak"
                    price="Rp18.500"
                    description={[
                        "Berlaku untuk anak usia 3–11 tahun. Gratis untuk anak di bawah 3 tahun.",
                        "Tiket berlaku hanya untuk satu kali kunjungan",
                    ]}
                    otsPrice="Rp24.000"
                    href="/checkout/anak"
                />
            </div>
        </section>
    );
}

export default TicketSection;
