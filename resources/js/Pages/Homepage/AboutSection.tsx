import useTranslate from "@/hooks/useTranslate";
import About1 from "../../../assets/images/image-about-1.png";
import About2 from "../../../assets/images/image-about-2.png";
import About3 from "../../../assets/images/image-about-3.png";
import About4 from "../../../assets/images/image-about-4.png";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

function AboutSection() {
    const t = useTranslate();

    const images = [About1, About2, About3, About4];

    return (
        <section className="bg-primary text-white py-16 px-4 lg:px-20">
            {/* Mobile & Tablet: Carousel */}
            <div className="block lg:hidden">
                {/* Header */}
                <div className="relative left-20 md:left-50 mb-16 md:mb-24 heading">
                    <div>{t("about")}</div>
                    <div>{t("exhi")}</div>
                    <div className="relative right-14 flex items-center gap-2">
                        <span className="w-20 h-1 bg-white"></span>
                        <span>{t("bition")}</span>
                    </div>
                </div>

                {/* Paragraph 1 */}
                <p className="paragraph mb-6">
                    {t("about-1")}
                </p>

                {/* Carousel */}
                <Swiper
                    spaceBetween={16}
                    slidesPerView={1.2}
                    breakpoints={{
                        800: {
                            slidesPerView: 2.5,
                        },
                        1024: {
                            slidesPerView: 1.2,
                        }
                    }}
                >
                    {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <img
                                src={img}
                                alt={`About ${idx + 1}`}
                                className="w-full md:w-80 lg:w-full aspect-square object-cover rounded-lg shadow-lg"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Paragraph 2 */}
                <p className="paragraph mt-6">
                    {t("about-2")}
                </p>
            </div>

            {/* Desktop: Layout original */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 lg:gap-4 xl:gap-2 items-start">
                {/* LEFT SIDE */}
                <div className="flex flex-col space-y-10">
                    {/* Title */}
                    <div className="relative lg:left-40 xl:left-50 heading">
                        <div>{t("about")}</div>
                        <div>{t("exhi")}</div>
                        <div className="relative lg:right-16 flex items-center gap-2">
                            <span className="w-28 h-2 bg-white"></span>
                            <span>{t("bition")}</span>
                        </div>
                    </div>

                    {/* Paragraph */}
                    <p className="paragraph max-w-xl">
                        {t("about-1")}
                    </p>

                    {/* Left images */}
                    <div className="space-y-20">
                        <img src={About2} alt="About 2" className="w-5/6 rounded shadow-lg" />
                        <div className="relative lg:left-24">
                            <img src={About3} alt="About 3" className="w-2/4 rounded shadow-lg" />
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="relative top-48 flex flex-col space-y-20">
                    {/* Top image */}
                    <img src={About1} alt="About 1" className="relative lg:left-42 xl:left-46 2xl:left-56 w-2/3 rounded shadow-lg" />

                    {/* Bottom grid: image + text */}
                    <div className="grid grid-cols-1 gap-6 items-start">
                        <img src={About4} alt="About 4" className="w-3/4 rounded shadow-lg" />
                        <p className="paragraph">
                            {t("about-2")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutSection;
