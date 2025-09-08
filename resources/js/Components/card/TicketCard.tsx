import { Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import Button from "@/Components/ui/button/Button";
import { IoMdArrowDropright } from "react-icons/io";
import { ReactNode } from "react";

interface TicketCardProps {
    title: string;
    details?: ReactNode;
    href: string;
}

const TicketCard = ({ title, details, href }: TicketCardProps) => {
    const t = useTranslate();

    return (
        <div className="relative border-2 border-white text-white flex flex-col justify-between p-6">
            {/* decorative shape */}
            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary border-2 border-white rounded-l-full"></div>

            {/* content */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
                </div>

                {/* detail section */}
                {details && (
                    <div className="text-sm leading-relaxed">{details}</div>
                )}
            </div>

            {/* action */}
            <Link
                href={href}
                className="flex justify-center items-center mt-10"
                target="_blank"
            >
                <Button
                    variant="outline"
                    size="sm"
                    className="px-12 text-lg font-medium hover:bg-white/10 rounded-none"
                >
                    {t("buy_ticket")} <IoMdArrowDropright size={24} />
                </Button>
            </Link>

            {/* decorative shape */}
            <div className="absolute bottom-1/2 -right-[73.5px] 2xl:-right-[74px] transform -translate-x-1/2 translate-y-1/2 w-12 h-14 bg-primary"></div>
        </div>
    );
};

export default TicketCard;
