import { useRef, useState, useEffect, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import type { Swiper as SwiperType } from "swiper";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IoIosArrowRoundForward, IoIosArrowRoundBack } from "react-icons/io";

function GallerySection() {
    const { locale, dioramas }: any = usePage().props;
    const t = useTranslate();
    const { translate } = useApiTranslate();

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["dioramas"], preserveUrl: true });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const basePaintings = useMemo(
        () =>
            dioramas.map((d: any) => ({
                title: d.title,
                desc: d.description,
                painter: d.author,
                image: d.thumbnail,
            })),
        [dioramas]
    );

    const [activeIndex, setActiveIndex] = useState(0);
    const [paintings, setPaintings] = useState(basePaintings);

    const thumbsSwiperRef = useRef<SwiperType | null>(null);

    useEffect(() => {
        const doTranslate = async () => {
            if (locale === "en") {
                const translated = await Promise.all(
                    basePaintings.map(async (p: any) => ({
                        ...p,
                        title: await translate(p.title, "en"),
                        desc: await translate(p.desc, "en"),
                    }))
                );
                setPaintings(translated);
            } else {
                setPaintings(basePaintings);
            }
        };
        doTranslate();
    }, [locale, basePaintings]);

    const goTo = (next: number) => {
        setActiveIndex(next);
        thumbsSwiperRef.current?.slideTo(next);
    };

    const handleNext = () => {
        const next = activeIndex === 0 ? paintings.length - 1 : activeIndex - 1;
        goTo(next);
    };

    const handlePrev = () => {
        const next = activeIndex === paintings.length - 1 ? 0 : activeIndex + 1;
        goTo(next);
    };

    return (
        <>
            {paintings.length > 0 && (
                <section className="bg-primary text-white py-16 px-4 lg:px-20">
                    {/* Header */}
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="heading">{t("gallery.heading")}</h2>
                        <p className="subheading">
                            {t("gallery.subheading").split("\n").map((line, i) => (
                                <span key={i}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>

                    <div className="flex flex-col gap-14 lg:flex-row lg:gap-18">
                        {/* LEFT: Main Image */}
                        <div className="flex items-center justify-center overflow-hidden w-full 2xl:w-1/2 h-[450px] md:h-[550px] 2xl:h-[550px]">
                            <PhotoProvider>
                                <PhotoView src={paintings[activeIndex]?.image}>
                                    <img
                                        src={paintings[activeIndex]?.image}
                                        alt={paintings[activeIndex]?.title}
                                        className="w-full h-[450px] md:h-[550px] md:w-[420px] lg:w-full object-cover block shadow-lg cursor-pointer"
                                        draggable={false}
                                    />
                                </PhotoView>
                            </PhotoProvider>
                        </div>

                        {/* RIGHT: Description & Thumbnails */}
                        <div className="w-full lg:w-7/12 2xl:w-full flex flex-col justify-start">
                            {/* Info */}
                            <div className="mb-8">
                                <h3 className="text-lg md:text-2xl font-semibold mb-4">
                                    {paintings[activeIndex]?.title}
                                </h3>
                                <p className="paragraph mb-8 h-32 sm:h-26 2xl:h-19">
                                    {paintings[activeIndex]?.desc}
                                </p>
                                <p className="font-semibold">
                                    - {paintings[activeIndex]?.painter}
                                </p>
                            </div>

                            {/* Navigasi & Thumbnails */}
                            <div className="relative">
                                <div className="flex justify-center lg:justify-end gap-3 mb-6">
                                    <button
                                        onClick={handleNext}
                                        className="border bg-transparent p-2 rounded-full hover:bg-white/10 transition"
                                    >
                                        <IoIosArrowRoundBack size={24} />
                                    </button>
                                    <button
                                        onClick={handlePrev}
                                        className="border bg-transparent p-2 rounded-full hover:bg-white/10 transition"
                                    >
                                        <IoIosArrowRoundForward size={24} />
                                    </button>
                                </div>

                                {/* Thumbnails */}
                                <div className="xl:max-w-3xl 2xl:max-w-4xl flex-shrink-0 hidden lg:block">
                                    <Swiper
                                        spaceBetween={12}
                                        slidesPerView={3.5}
                                        style={{ width: "100%" }}
                                        allowTouchMove={false}
                                        breakpoints={{
                                            640: { slidesPerView: 3.5 },
                                            1024: { slidesPerView: 3.5 },
                                        }}
                                    >
                                        {[
                                            ...paintings.slice(activeIndex + 1),
                                            ...paintings.slice(0, activeIndex),
                                        ].map((p, idx) => (
                                            <SwiperSlide key={idx}>
                                                <div className="w-full h-[120px] md:h-[272px] lg:h-[246px] 2xl:h-[272px] shadow-md flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={p.image}
                                                        alt={p.title}
                                                        className="w-full h-full object-cover pointer-events-none select-none"
                                                        draggable={false}
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="paragraph text-center mt-8 lg:mt-16">
                        {t("gallery.email-1")}
                        <a
                            href="mailto:soetala.lab@gmail.com"
                            className="underline"
                        >
                            soetala.lab@gmail.com
                        </a>
                        <br />
                        {t("gallery.email-2")}
                    </p>
                </section>
            )}
        </>
    );
}

export default GallerySection;
