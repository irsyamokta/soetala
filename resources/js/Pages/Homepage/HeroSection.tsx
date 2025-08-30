import useTranslate from "@/hooks/useTranslate";
import Button from "@/Components/ui/button/Button";
import HeroImage from "../../../assets/images/image-hero.png";
import { IoMdArrowDropright } from "react-icons/io";

function HeroSection() {
    const t = useTranslate();

    return (
        <section className="relative h-screen w-full bg-cover bg-center flex items-center
                justify-center lg:justify-start"
            style={{
                backgroundImage: `url(${HeroImage})`,
            }}
        >
            <div className="relative z-10 text-center lg:text-start text-white px-4 md:px-20">
                <p className="lg:relative lg:left-50 lg:top-30 uppercase tracking-wider text-sm md:text-xl mb-2">
                    November 10-16, 2025
                </p>
                <h1 className="text-9xl md:text-[250px] lg:text-[350px] font-cormorant font-bold mb-6">
                    Soetala
                </h1>

                <Button
                    variant="outline"
                    size="sm"
                    className="lg:relative lg:left-50 lg:bottom-10 px-8 text-lg font-medium hover:bg-white/10 rounded-none"
                >
                    {t("buy_ticket")} <IoMdArrowDropright size={24} />
                </Button>
            </div>
        </section>
    )
}

export default HeroSection;
