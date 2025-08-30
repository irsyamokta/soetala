import { useRef, useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import type { Swiper as SwiperType } from "swiper";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IoIosArrowRoundForward, IoIosArrowRoundBack } from "react-icons/io";

import Painting1 from "../../../assets/images/image-painting-1.png";
import Painting2 from "../../../assets/images/image-painting-2.png";
import Painting3 from "../../../assets/images/image-painting-3.png";
import Painting4 from "../../../assets/images/image-painting-4.png";
import Painting5 from "../../../assets/images/image-about-1.png";
import Painting6 from "../../../assets/images/image-about-2.png";
import Painting7 from "../../../assets/images/image-about-3.png";

function GallerySection() {
    const t = useTranslate();
    const { locale }: any = usePage().props;
    const { translate } = useApiTranslate();

    const basePaintings = [
        {
            title: "Judul Karya Lukisan",
            desc: "Dalam pameran ini, kami berusaha mengajak anak muda agar semakin akrab mengenal arti patriotisme, keberanian, serta keteguhan Jenderal Soedirman. Karya seni bukan sekadar saksi sejarah, melainkan jembatan pesan perjuangan agar terus bersemayam di hati kita bersama.",
            painter: "Nama Pelukis",
            image: Painting1,
        },
        {
            title: "Mona Lisa",
            desc: "Lewat pameran ini, generasi muda kami ajak untuk lebih memahami makna patriotisme, keberanian, dan semangat teguh Jenderal Soedirman. Seni tidak semata menjadi saksi sejarah, namun juga penghubung pesan perjuangan supaya senantiasa hidup di lubuk hati setiap insan bangsa.",
            painter: "Leonardo da Vinci",
            image: Painting2,
        },
        {
            title: "Scene Kerakyatan",
            desc: "Pameran ini menjadi sarana mengajak generasi penerus agar mendekatkan diri dengan nilai patriotisme, keberanian, serta tekad Jenderal Soedirman. Seni berperan bukan hanya saksi perjalanan sejarah, melainkan penghubung pesan perjuangan supaya tetap abadi dalam ingatan bersama.",
            painter: "Pelukis Nusantara",
            image: Painting3,
        },
        {
            title: "Detail Tangan",
            desc: "Melalui kegiatan pameran ini, harapan kami ialah membawa generasi muda mengenal lebih jauh arti patriotisme, keberanian, dan keteguhan Jenderal Soedirman. Seni hadir bukan cuma saksi sejarah, melainkan juga perantara pesan perjuangan agar tetap hidup di hati bangsa kita semua.",
            painter: "Pelukis Lokal",
            image: Painting4,
        },
        {
            title: "Detail Tangan",
            desc: "Pameran ini kami sajikan untuk mengajak generasi muda mengenal lebih dekat nilai patriotisme, keberanian, serta keteguhan Jenderal Soedirman. Seni berfungsi tidak hanya menjadi saksi sejarah, tetapi juga perantara pesan perjuangan supaya senantiasa hidup dalam hati rakyat semua.",
            painter: "Pelukis Lokal",
            image: Painting5,
        },
        {
            title: "Detail Tangan",
            desc: "Melalui pameran seni ini, tujuan kami adalah mendorong generasi muda agar lebih mengenal nilai patriotisme, keberanian, dan keteguhan Jenderal Soedirman. Karya seni bukan hanya saksi sejarah, melainkan juga penghubung pesan perjuangan supaya terus hidup dalam hati seluruh bangsa.",
            painter: "Pelukis Lokal",
            image: Painting6,
        },
        {
            title: "Detail Tangan",
            desc: "Acara pameran ini hadir untuk mengajak generasi muda lebih mengenal nilai patriotisme, keberanian, serta keteguhan hati Jenderal Soedirman. Seni memiliki peran tidak hanya sebagai saksi sejarah, namun juga perantara pesan perjuangan agar tetap hidup dalam jiwa masyarakat luas.",
            painter: "Pelukis Lokal",
            image: Painting7,
        },
    ];


    const [activeIndex, setActiveIndex] = useState(0);
    const [paintings, setPaintings] = useState(basePaintings);

    const thumbsSwiperRef = useRef<SwiperType | null>(null);

    useEffect(() => {
        const doTranslate = async () => {
            if (locale === "en") {
                const translated = await Promise.all(
                    basePaintings.map(async (p) => ({
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
    }, [locale]);

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
                        <PhotoView src={paintings[activeIndex].image}>
                            <img
                                src={paintings[activeIndex].image}
                                alt={paintings[activeIndex].title}
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
                        <h3 className="text-lg md:text-2xl font-semibold mb-4">{paintings[activeIndex].title}</h3>
                        <p className="paragraph mb-8">{paintings[activeIndex].desc}</p>
                        <p className="font-semibold">- {paintings[activeIndex].painter}</p>
                    </div>

                    {/* Navigasi & Thumbnails */}
                    <div className="relative">
                        {/* Navigation buttons tablet & desktop */}
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
                <a href="mailto:soetala.lab@gmail.com" className="underline">
                    soetala.lab@gmail.com
                </a>
                <br />{t("gallery.email-2")}
            </p>
        </section>
    );
}

export default GallerySection;
