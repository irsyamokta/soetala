import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { LuMinus, LuPlus } from "react-icons/lu";

import merch1 from "../../../assets/images/image-merch-2.png";
import merch2 from "../../../assets/images/image-merch-3.png";
import merch3 from "../../../assets/images/image-merch-4.png";
import merch4 from "../../../assets/images/image-merch-5.png";
import useTranslate from "@/hooks/useTranslate";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";


export default function MerchandiseSection() {
    const [quantity, setQuantity] = useState(2);
    const [color, setColor] = useState("white");
    const [size, setSize] = useState("M");
    const [mainImage, setMainImage] = useState(merch1);

    const t = useTranslate();

    const price = 150000;
    const subtotal = price * quantity;

    const { data, setData, post } = useForm({
        color: color,
        size: size,
        note: "",
        quantity: quantity,
    });

    // const handleSubmit = () => {
    //     post(route("merchandise.order"), {
    //         data: { ...data, color, size, quantity },
    //     });
    // };

    return (
        <section className="bg-primary text-white py-16 px-4 lg:px-20">
            {/* Header */}
            <div className="text-centr mb-16 md:mb-24">
                <h2 className="heading text-center">{t("merch.heading")}</h2>
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
                 {/* Left - Product Image */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <img
                        src={mainImage}
                        alt="Merchandise"
                        className="rounded-lg shadow-md lg:w-[400px] md:h-[500px] object-cover"
                    />
                    <div className="flex justify-center lg:flex-col lg:justify-start gap-4">
                        {[merch1, merch2, merch3, merch4].map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                onClick={() => setMainImage(img)}
                                className={`w-18 h-18 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-md border cursor-pointer hover:scale-105 transition ${
                                    mainImage === img ? "ring-2 ring-secondary" : ""
                                }`}
                                alt={`thumbnail-${i}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right - Details */}
                <div className="lg:w-1/2">
                    <h2 className="text-2xl font-semibold mb-4">
                        Official Soetala Merchandise
                    </h2>
                    <p className="text-sm mb-4 leading-relaxed">
                        Kaos resmi Soetala ini terbuat dari bahan katun berkualitas tinggi,
                        nyaman dipakai, dan memiliki desain eksklusif yang hanya tersedia
                        untuk pengunjung Soetala. Tampilkan gayamu sekaligus abadikan
                        momen berkesanmu!
                    </p>

                    <p className="text-2xl lg:text-4xl font-semibold mb-10">Rp{price.toLocaleString("id-ID")}</p>

                    <div className="flex flex-col md:flex-row lg:justify-between gap-4 md:gap-10 mb-4 md:mb-8">
                        {/* Color */}
                        <div className="mb-4">
                            <p className="font-semibold mb-2">{t("merch.color")}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setColor("white")}
                                    className={`w-8 h-8 rounded-full border ${color === "white" ? "ring-2 ring-secondary" : ""}`}
                                    style={{ backgroundColor: "#ffffff" }}
                                />
                                <button
                                    onClick={() => setColor("black")}
                                    className={`w-8 h-8 rounded-full border ${color === "black" ? "ring-2 ring-secondary" : ""}`}
                                    style={{ backgroundColor: "#000" }}
                                />
                            </div>
                        </div>

                        {/* Size */}
                        <div className="mb-4">
                            <p className="font-semibold mb-2">{t("merch.size")}</p>
                            <div className="flex gap-3">
                                {["S", "M", "L", "XL"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`px-4 py-2 rounded-md border ${size === s ? "bg-white text-[#0E4A86] font-bold" : "bg-transparent border-white"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <p className="font-semibold mb-2">{t("merch.note")}</p>
                            <Input
                                type="text"
                                className="w-full px-3 py-2 rounded-none text-white"
                                placeholder="Tulis catatan..."
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
                                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                                    className="px-1 py-2 rounded-md border"
                                >
                                    <LuMinus size={16} />
                                </button>
                                <span className="px-4 font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-1 py-2 rounded-md border"
                                >
                                    <LuPlus size={16} />
                                </button>
                                <span className="text-[#FFFB00] text-sm font-semibold">{t("merch.stock")}: {t("merch.reminder")} 8</span>
                            </div>
                        </div>

                        {/* Subtotal */}
                        <div>
                            <p className="text-sm text-gray-200 mb-4">Subtotal</p>
                            <p className="text-3xl font-semibold">Rp{subtotal.toLocaleString("id-ID")}</p>
                        </div>
                    </div>

                    {/* Button */}
                    <Button
                        // onClick={handleSubmit}
                        variant="outline"
                        size="sm"
                        className="w-full py-3 text-lg font-medium hover:bg-white/10 rounded-none"
                    >
                        {t("merch.button")}
                    </Button>
                </div>
            </div>
        </section>
    );
}
