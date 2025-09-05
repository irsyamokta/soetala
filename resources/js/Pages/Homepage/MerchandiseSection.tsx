import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import { LuMinus, LuPlus } from "react-icons/lu";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";

interface MerchForm {
    color: string;
    size: string;
    note: string;
    quantity: number;
}

function MerchandiseSection() {
    const { locale, merchant: merchantArr }: any = usePage().props;
    const merchant = merchantArr?.[0];
    const t = useTranslate();
    const { translate } = useApiTranslate();

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["merchant"], preserveUrl: true });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const [mainImage, setMainImage] = useState(merchant?.thumbnail);

    const { data, setData } = useForm<MerchForm>({
        color: merchant?.variants?.[0]?.color ?? "",
        size: merchant?.variants?.[0]?.size ?? "",
        note: "",
        quantity: 1,
    });

    const [merch, setMerch] = useState({
        title: merchant?.product_name ?? "",
        desc: merchant?.description ?? "",
    });

    useEffect(() => {
        const doTranslate = async () => {
            if (!merchant) return;
            if (locale === "en") {
                setMerch({
                    title: await translate(merchant.product_name, "en"),
                    desc: await translate(merchant.description, "en"),
                });
            } else {
                setMerch({
                    title: merchant.product_name,
                    desc: merchant.description,
                });
            }
        };
        doTranslate();
    }, [locale, merchant]);

    const selectedVariant = (merchant?.variants ?? []).find(
        (v: any) => v.color === data.color && v.size === data.size
    );
    const selectedStock = selectedVariant?.stock ?? 0;

    useEffect(() => {
        if (data.quantity > selectedStock) {
            setData("quantity", Math.max(1, selectedStock));
        }
    }, [data.color, data.size, selectedStock]);

    const subtotal = merchant?.price * data.quantity;

    return (
        <>
            {merchant && (
                <section className="bg-primary text-white py-16 px-4 lg:px-20">
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

                    {/* Content */}
                    <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8">
                        {/* Left - Product Image + Gallery */}
                        <div className="flex flex-col gap-4">
                            <img
                                src={mainImage}
                                alt={merch.title}
                                className="rounded-md shadow-md h-[300px] md:h-[400px] object-cover"
                            />
                            <div className="flex justify-center gap-4">
                                {(merchant.images ?? []).map((img: any, i: number) => (
                                    <img
                                        key={i}
                                        src={img.image}
                                        onClick={() => setMainImage(img.image)}
                                        className={`w-18 h-18 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-md border cursor-pointer hover:scale-105 transition ${mainImage === img.image ? "ring-2 ring-secondary" : ""
                                            }`}
                                        alt={`thumbnail-${i}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right - Details */}
                        <div className="lg:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">{merch.title}</h2>
                            <p className="text-sm mb-4 leading-relaxed">{merch.desc}</p>

                            <p className="text-2xl lg:text-4xl font-semibold mb-10">
                                {formatCurrency(merchant.price)}
                            </p>

                            {/* Variants */}
                            <div className="flex flex-col md:flex-row lg:justify-between gap-4 md:gap-10 mb-4 md:mb-8">
                                {/* Color */}
                                <div className="mb-4">
                                    <p className="font-semibold mb-2">{t("merch.color")}</p>
                                    <div className="flex gap-3">
                                        {([...new Set((merchant?.variants ?? []).map((v: any) => v.color))] as string[]).map(
                                            (c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setData("color", c)}
                                                    className={`w-8 h-8 rounded-full border ${data.color === c ? "ring-2 ring-secondary" : ""
                                                        }`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Size */}
                                <div className="mb-4">
                                    <p className="font-semibold mb-2">{t("merch.size")}</p>
                                    <div className="flex gap-3">
                                        {([...new Set((merchant?.variants ?? []).map((v: any) => v.size))] as string[]).map(
                                            (s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setData("size", s)}
                                                    className={`px-4 py-2 rounded-md border ${data.size === s
                                                        ? "bg-white text-[#0E4A86] font-bold"
                                                        : "bg-transparent border-white"
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="mb-4">
                                    <p className="font-semibold mb-2">{t("merch.note")}</p>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-none text-white border border-white focus:outline-hidden focus:ring-0"
                                        placeholder={t("merch.note-placeholder")}
                                        value={data.note}
                                        onChange={(e) => setData("note", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 mb-8">
                                <div>
                                    <p className="font-semibold mb-4">{t("merch.quantity")}</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                setData("quantity", Math.max(1, data.quantity - 1))
                                            }
                                            className="px-1 py-2 rounded-md border"
                                        >
                                            <LuMinus size={16} />
                                        </button>
                                        <span className="px-4 font-semibold">{data.quantity}</span>
                                        <button
                                            onClick={() =>
                                                setData("quantity", Math.min(selectedStock, data.quantity + 1))
                                            }
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
                                    <p className="text-3xl font-semibold">
                                        {formatCurrency(subtotal)}
                                    </p>
                                </div>
                            </div>

                            {/* Button */}
                            <Link href={merchant?.id}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full py-3 text-lg font-medium hover:bg-white/10 rounded-none"
                                    disabled={selectedStock === 0}
                                >
                                    {selectedStock > 0 ? t("merch.button") : "Stok Habis"}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default MerchandiseSection;
