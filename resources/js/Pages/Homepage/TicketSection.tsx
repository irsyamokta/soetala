import { useEffect, useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import Button from "@/Components/ui/button/Button";
import { IoMdArrowDropright } from "react-icons/io";
import ImageTicket from "../../../assets/images/image-ticket.png";
import { LuCalendar, LuClock, LuMapPin } from "react-icons/lu";

type TicketCategory = {
    category_name: string;
    description?: string;
};

type Ticket = {
    id: string;
    title: string;
    description: string;
    price: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    location: string;
    thumbnail: string;
    categories: TicketCategory[];
};

function TicketSection() {
    const { locale, ticket } = usePage<{
        auth: any;
        locale: string;
        ticket: Ticket[];
    }>().props;

    const t = useTranslate();

    const [tickets, setTickets] = useState<Ticket[]>(ticket || []);

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetDate = new Date("2025-11-10T00:00:00+07:00");

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((distance / (1000 * 60)) % 60),
                seconds: Math.floor((distance / 1000) % 60),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, []);

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

                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-0 max-w-4xl w-full">
                        {/* Image */}
                        <div className="flex-1">
                            <img
                                src={ImageTicket}
                                alt="Auction"
                                className="rounded-ss-[52px] rounded-ee-[52px] shadow-lg sm:h-112 object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                {t("ticket.title")}
                            </h2>
                            <p className="text-sm md:text-base text-white/80 mb-6">
                                {t("ticket.description")}
                            </p>

                            <div className="flex flex-col gap-2 mb-4">
                                <p className="flex items-center gap-2">
                                    <LuCalendar /> 10 - 15 November 2025
                                </p>
                                <p className="flex items-center gap-2">
                                    <LuClock /> 09.00 - 20.00 WIB
                                </p>
                                <p className="flex items-center gap-2">
                                    <LuMapPin /> Museum Panglima Besar Jenderal Soedirman
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="w-full flex items-center gap-6 mb-6">
                                <div className="w-full sm:w-auto">
                                    <Link href={route("checkout.index")} target="_blank">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto px-12 text-lg font-medium hover:bg-white/10 rounded-none"
                                        >
                                            {t("buy_ticket")} <IoMdArrowDropright size={24} />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Countdown */}
                            <div className="flex justify-center sm:justify-start gap-3">
                                <div className="bg-white/10 rounded-md px-4 py-2 text-center">
                                    <div className="text-2xl font-bold">{timeLeft.days}</div>
                                    <div className="text-xs">{t("ticket.days")}</div>
                                </div>
                                <div className="bg-white/10 rounded-md px-4 py-2 text-center">
                                    <div className="text-2xl font-bold">{timeLeft.hours}</div>
                                    <div className="text-xs">{t("ticket.hours")}</div>
                                </div>
                                <div className="bg-white/10 rounded-md px-4 py-2 text-center">
                                    <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                                    <div className="text-xs">{t("ticket.minutes")}</div>
                                </div>
                                <div className="bg-white/10 rounded-md px-4 py-2 text-center">
                                    <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                                    <div className="text-xs">{t("ticket.seconds")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default TicketSection;
