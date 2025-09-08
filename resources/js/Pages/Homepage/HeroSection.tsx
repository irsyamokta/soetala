import { Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import Button from "@/Components/ui/button/Button";
import HeroImage from "../../../assets/images/image-hero.png";
import { IoMdArrowDropright } from "react-icons/io";
import { useEffect, useState } from "react";

import Clip1 from "../../../assets/images/clip-1.png";
import Clip2 from "../../../assets/images/clip-2.png";
import Clip3 from "../../../assets/images/clip-3.png";
import Clip4 from "../../../assets/images/clip-4.png";

function HeroSection() {
    const t = useTranslate();

    const clipImages = [Clip1, Clip2, Clip3, Clip4];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % clipImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [clipImages.length]);

    return (
        <section
            className="relative h-screen w-full bg-cover bg-center flex items-center justify-center lg:justify-start"
            style={{
                backgroundImage: `url(${HeroImage})`,
            }}
        >
            <div className="relative z-10 text-center lg:text-start text-white px-4 md:px-20">
                <p className="relative top-10 lg:left-50 md:top-14 lg:top-28 2xl:top-32 uppercase tracking-wider text-sm md:text-xl mb-2">
                    November 10-16, 2025
                </p>

                <h1
                    className="text-[160px] md:text-[250px] lg:text-[400px] 2xl:text-[450px]
                               font-mezirane mb-6 text-transparent bg-clip-text bg-center bg-cover
                               transition-all duration-700"
                    style={{
                        backgroundImage: `url(${clipImages[index]})`,
                        backgroundPosition: "top",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    SOETALA
                </h1>

                <Link href={route("checkout.index")}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="relative bottom-10 lg:left-50 md:bottom-14 lg:bottom-28 2xl:bottom-32 px-8 text-lg font-medium hover:bg-white/10 rounded-none"
                    >
                        {t("buy_ticket")} <IoMdArrowDropright size={24} />
                    </Button>
                </Link>
            </div>
        </section>
    );
}

export default HeroSection;
