import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { toast } from "react-toastify";

import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";

import Button from "@/Components/ui/button/Button";

import { formatCurrency } from "@/utils/formatCurrency";

import { LuMinus, LuPlus } from "react-icons/lu";

import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/navigation";

interface Variant {
    color: string;
    size: string;
    stock: number;
    image?: string;
}

interface Image {
    image: string;
    variant?: {
        color: string;
        size: string;
    };
}

interface Product {
    id: string | number;
    category?: {
        category_name: string;
    };
    product_name: string;
    description: string;
    price: number;
    thumbnail: string;
    variants: Variant[];
    images: Image[];
}

interface MerchForm {
    color: string;
    size: string;
    note: string;
    quantity: number;
}

interface MerchState {
    title: string;
    desc: string;
}

interface MerchItemProps {
    product: Product;
    locale: string;
    t: (key: string) => string;
    translate: (text: string, lang: string) => Promise<string>;
}

function MerchItem({ product, locale, t, translate }: MerchItemProps) {
    const { auth } = usePage().props;
    const isShirt = product.category?.category_name.toLowerCase().includes("shirt");
    const [mainImage, setMainImage] = useState<string>(product?.thumbnail ?? "");
    const [loading, setLoading] = useState(false);
    const [isManualImageSelection, setIsManualImageSelection] = useState(false);
    const [data, setData] = useState<MerchForm>({
        color: isShirt && product.variants?.length > 0 ? product.variants[0].color : "",
        size: isShirt && product.variants?.length > 0 ? product.variants[0].size : "",
        note: "",
        quantity: 1,
    });
    const [merch, setMerch] = useState<MerchState>({
        title: product?.product_name ?? "",
        desc: product?.description ?? "",
    });

    useEffect(() => {
        const doTranslate = async () => {
            if (!product) return;
            if (locale === "en") {
                setMerch({
                    title: await translate(product.product_name, "en"),
                    desc: await translate(product.description, "en"),
                });
            } else {
                setMerch({
                    title: product.product_name,
                    desc: product.description,
                });
            }
        };
        doTranslate();
    }, [locale, product, translate]);

    useEffect(() => {
        if (isManualImageSelection || !data.color || !data.size) return;

        const selectedVariant = product.variants.find(
            (v) => v.color === data.color && v.size === data.size
        );
        const variantImage = product.images.find(
            (img) => img.variant?.color === data.color && img.variant?.size === data.size
        )?.image;

        setMainImage(variantImage || selectedVariant?.image || product.thumbnail);
    }, [data.color, data.size, product, isManualImageSelection]);

    useEffect(() => {
        setIsManualImageSelection(false);
    }, [data.color, data.size]);

    const selectedStock = isShirt
        ? product.variants.find((v) => v.color === data.color && v.size === data.size)?.stock ?? 0
        : product.variants.reduce((acc, v) => acc + v.stock, 0);

    const subtotal = product?.price * data.quantity;

    const handleClick = () => {
        if (!auth.user) {
            router.visit(route("login"));
            return;
        }
        handleBuyNow();
    };

    const handleBuyNow = () => {
        if (selectedStock === 0) {
            toast.error("Stok habis!");
            return;
        }
        if (isShirt && (!data.color || !data.size)) {
            toast.error("Pilih warna dan ukuran terlebih dahulu!");
            return;
        }

        setLoading(true);

        router.post(
            route("checkout.store"),
            {
                user_id: auth.user.id,
                type: "merchandise",
                channel: "online",
                payment_method: null,
                total_price: subtotal,
                items: [
                    {
                        item_type: "product",
                        item_id: product.id,
                        item_name: product.product_name,
                        quantity: data.quantity,
                        price: product.price,
                        color: isShirt ? data.color : undefined,
                        size: isShirt ? data.size : undefined,
                        note: data.note,
                    },
                ],
            },
            {
                onSuccess: () => {
                    setLoading(false);
                    router.visit(route("checkout.history"));
                },
                onError: (errors) => {
                    toast.error(errors.error || "Gagal membuat transaksi");
                    setLoading(false);
                },
            }
        );
    };

    useEffect(() => {
        if (data.quantity > selectedStock) {
            setData((prev) => ({ ...prev, quantity: Math.max(1, selectedStock) }));
        }
    }, [selectedStock, data.quantity]);

    const galleryImages = [
        ...product.images,
        ...product.variants
            .filter((v) => v.image && !product.images.some((img) => img.image === v.image))
            .map((v) => ({ image: v.image, variant: { color: v.color, size: v.size } })),
    ];

    const handleSizeClick = (size: string) => {
        setData((prev) => ({ ...prev, size }));
        if (data.size === size) {
            const selectedVariant = product.variants.find(
                (v) => v.color === data.color && v.size === size
            );
            const variantImage = product.images.find(
                (img) => img.variant?.color === data.color && img.variant?.size === size
            )?.image;
            setMainImage(variantImage || selectedVariant?.image || product.thumbnail);
            setIsManualImageSelection(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8">
            {/* Left - Product Image + Gallery */}
            <div className="flex flex-col gap-4">
                <img
                    src={mainImage}
                    alt={merch.title}
                    className="rounded-md shadow-md h-[300px] md:h-[400px] object-cover"
                />
                <div className="flex justify-center gap-4">
                    {galleryImages.length <= 4 ? (
                        galleryImages.map((img, i) => (
                            <img
                                key={i}
                                src={img.image}
                                onClick={() => {
                                    setMainImage(img.image || product.thumbnail);
                                    setIsManualImageSelection(true);
                                }}
                                className={`w-18 h-18 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-md border cursor-pointer hover:scale-105 transition ${
                                    mainImage === img.image ? "ring-2 ring-secondary" : ""
                                }`}
                                alt={`thumbnail-${i}`}
                            />
                        ))
                    ) : (
                        <Swiper
                            modules={[]}
                            spaceBetween={10}
                            slidesPerView={4}
                            className="w-[320px] md:w-[400px] lg:w-[360px] p-2"
                        >
                            {galleryImages.map((img, i) => (
                                <SwiperSlide key={i} className="p-1">
                                    <img
                                        src={img.image}
                                        onClick={() => {
                                            setMainImage(img.image || product.thumbnail);
                                            setIsManualImageSelection(true);
                                        }}
                                        className={`w-18 h-18 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-md border cursor-pointer hover:scale-105 transition ${
                                            mainImage === img.image ? "ring-2 ring-secondary" : ""
                                        }`}
                                        alt={`thumbnail-${i}`}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>

            {/* Right - Details */}
            <div className="lg:w-1/2">
                <h2 className="text-2xl font-semibold mb-4">{merch.title}</h2>
                <p className="text-sm mb-4 leading-relaxed">{merch.desc}</p>

                <p className="text-2xl lg:text-4xl font-semibold mb-10">{formatCurrency(product.price)}</p>

                {/* Variants */}
                {isShirt && (
                    <div className="flex flex-col md:flex-row lg:justify-between gap-4 md:gap-10 mb-4 md:mb-8">
                        {/* Color */}
                        <div className="mb-4">
                            <p className="font-semibold mb-2">{t("merch.color")}</p>
                            <div className="flex gap-3">
                                {[...new Set(product.variants.map((v) => v.color))].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setData((prev) => ({ ...prev, color: c }))}
                                        className={`w-8 h-8 rounded-full border ${
                                            data.color === c ? "ring-2 ring-secondary" : ""
                                        }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="mb-4">
                            <p className="font-semibold mb-2">{t("merch.size")}</p>
                            <div className="flex gap-3">
                                {[...new Set(product.variants.map((v) => v.size))].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSizeClick(s)}
                                        className={`px-4 py-2 rounded-md border ${
                                            data.size === s ? "bg-white text-[#0E4A86] font-bold" : "bg-transparent border-white"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="mb-4">
                            <p className="font-semibold mb-2">{t("merch.note")}</p>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded-none text-white border border-white focus:outline-none focus:ring-0"
                                placeholder={t("merch.note-placeholder")}
                                value={data.note}
                                onChange={(e) => setData((prev) => ({ ...prev, note: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                {!isShirt && (
                    <div className="mb-4">
                        <p className="font-semibold mb-2">{t("merch.note")}</p>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded-none text-white border border-white focus:outline-none focus:ring-0"
                            placeholder={t("merch.note-placeholder")}
                            value={data.note}
                            onChange={(e) => setData((prev) => ({ ...prev, note: e.target.value }))}
                        />
                    </div>
                )}

                {/* Quantity */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 mb-8">
                    <div>
                        <p className="font-semibold mb-4">{t("merch.quantity")}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setData((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                                className="px-1 py-2 rounded-md border"
                            >
                                <LuMinus size={16} />
                            </button>
                            <span className="px-4 font-semibold">{data.quantity}</span>
                            <button
                                onClick={() => setData((prev) => ({ ...prev, quantity: Math.min(selectedStock, prev.quantity + 1) }))}
                                className="px-1 py-2 rounded-md border"
                                disabled={data.quantity >= selectedStock}
                            >
                                <LuPlus size={16} />
                            </button>
                            <span className="text-[#FFFB00] text-sm font-semibold">
                                {t("merch.stock")}: {selectedStock}
                            </span>
                        </div>
                    </div>

                    {/* Subtotal */}
                    <div>
                        <p className="text-sm text-gray-200 mb-4">Subtotal</p>
                        <p className="text-3xl font-semibold">{formatCurrency(subtotal)}</p>
                    </div>
                </div>

                {/* Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full py-3 text-lg font-medium hover:bg-white/10 rounded-none"
                    onClick={handleClick}
                    disabled={selectedStock === 0 || loading || (isShirt && (!data.color || !data.size))}
                >
                    {loading
                        ? "Processing..."
                        : selectedStock > 0
                            ? t("merch.button")
                            : t("merch.modal.button.disable").toUpperCase()}
                </Button>
            </div>
        </div>
    );
}

function MerchandiseSection() {
    const { locale, merchant: merchantArr } = usePage<InertiaPageProps & { locale: string; merchant: Product[] }>().props;
    const t = useTranslate();
    const { translate } = useApiTranslate();

    if (!merchantArr || merchantArr.length === 0) {
        return null;
    }

    return (
        <section className="bg-primary text-white py-16 px-4 lg:px-20 relative">
            {/* Header */}
            <div className="text-center mb-16 md:mb-24">
                <h2 className="heading">{t("merch.heading")}</h2>
                <p className="subheading">
                    {t("merch.subheading").split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            <br />
                        </span>
                    ))}
                </p>
            </div>

            {/* Slider */}
            <div className="relative">
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl: ".swiper-button-prev-custom",
                        nextEl: ".swiper-button-next-custom",
                        disabledClass: "opacity-50 cursor-not-allowed",
                    }}
                    spaceBetween={50}
                    slidesPerView={1}
                    className="relative"
                    allowTouchMove={false}
                    onSwiper={(swiper) => {
                        setTimeout(() => {
                            swiper.navigation.init();
                            swiper.navigation.update();
                        });
                    }}
                >
                    {merchantArr.map((product, i) => (
                        <SwiperSlide key={i}>
                            <MerchItem product={product} locale={locale} t={t} translate={translate} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Buttons (Desktop) */}
                <div className="swiper-button-prev-custom absolute top-1/2 left-0 transform -translate-y-1/2 z-10 text-white hover:text-secondary cursor-pointer transition-colors hidden lg:block">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-14 h-14"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
                <div className="swiper-button-next-custom absolute top-1/2 right-0 transform -translate-y-1/2 z-10 text-white hover:text-secondary cursor-pointer transition-colors hidden lg:block">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-14 h-14"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </div>

                {/* Mobile Navigation Buttons */}
                <div className="lg:hidden md:absolute md:top-1/5 flex justify-center md:justify-between w-full mt-4 z-9999">
                    <div className="swiper-button-prev-custom text-white hover:text-secondary transition-colors cursor-pointer p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-10 h-10"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <div className="swiper-button-next-custom text-white hover:text-secondary transition-colors cursor-pointer p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-10 h-10"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default MerchandiseSection;
