import { Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import Button from "@/Components/ui/button/Button";
import { IoMdArrowDropright } from "react-icons/io";

interface TicketCardProps {
    title: string;
    price: string;
    requirement: string;
    otsPrice: string;
    href: string;
}

const TicketCard = ({ title, price, requirement, otsPrice, href }: TicketCardProps) => {
    const t = useTranslate();

    return (
        <>
            <div className="relative min-h-100 border-2 border-white text-white flex flex-col justify-between p-6">
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary border-2 border-white rounded-l-full"></div>

                <div>
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>
                        <span className="text-xl md:text-2xl">{price}</span>
                    </div>
                    <p className="paragraph mb-4">{requirement}</p>
                    {/* {description.map((d: string, i: number) => (
                    ))} */}
                    <p className="paragraph mt-10">{t("ots_price")} {otsPrice}</p>
                </div>
                <Link
                    href={href}
                    className="flex justify-center items-center mt-10"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-12 text-lg font-medium hover:bg-white/10 rounded-none"
                    >
                        {t("buy_ticket")} <IoMdArrowDropright size={24} />
                    </Button>
                </Link>

                <div className="absolute bottom-1/2 -right-[73.5px] 2xl:-right-[74px] transform -translate-x-1/2 translate-y-1/2 w-12 h-14 bg-primary"></div>
            </div>
        </>
    );
}

export default TicketCard;
