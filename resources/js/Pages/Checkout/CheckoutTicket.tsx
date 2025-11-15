import { useState, useEffect, useMemo, useRef } from "react";
import { Head, usePage, router } from "@inertiajs/react";

import { toast } from "react-toastify";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";

import { ModalMerchandiseSelection } from "./Components/modal/ModalMerchandiseSelection";
import Button from "@/Components/ui/button/Button";
import AppNavbar from "@/Components/app/AppNavbar";
import Description from "@/Components/Description";

import { formatCurrency } from "@/utils/formatCurrency";
import capitalizeFirst from "@/utils/capitalize";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LuMinus, LuPlus } from "react-icons/lu";

import { Ticket, Merch, OrderItem, MerchModalData } from "@/types/types";

export default function CheckoutTicket({
    tickets = [],
    merchandises = [],
}: {
    tickets: Ticket[];
    merchandises: Merch[];
}) {
    const [lang, setLang] = useState<"id" | "en">("id");
    const { locale, auth } = usePage().props;

    const t = useTranslate();
    const { translate } = useApiTranslate();

    const [loading, setLoading] = useState(false);
    const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
    const [merchModal, setMerchModal] = useState<MerchModalData | null>(null);

    const translateRef = useRef(translate);
    useEffect(() => {
        translateRef.current = translate;
    }, [translate]);

    const categoryMap: Record<string, string> = useMemo(
        () => ({
            adult: "Dewasa",
            child: "Anak",
        }),
        []
    );

    const categoryReverseMap: Record<string, string> = useMemo(
        () => ({
            dewasa: "adult",
            anak: "child",
            adult: "adult",
            child: "child",
            mature: "adult",
        }),
        []
    );

    const [localizedTickets, setLocalizedTickets] = useState<Ticket[]>(tickets);

    useEffect(() => {
        const doTranslate = async () => {
            if (!tickets) return;

            if (locale === "en") {
                const translated = await Promise.all(
                    tickets.map(async (t: any) => {
                        const translatedCategory = await translate(t.category, "en");
                        const translatedDescription = await translate(t.description, "en");
                        const normalizedCategory = translatedCategory.toLowerCase().includes("mature")
                            ? "adult"
                            : translatedCategory.toLowerCase().includes("child")
                                ? "child"
                                : translatedCategory;
                        return {
                            ...t,
                            category: normalizedCategory,
                            description: translatedDescription,
                        };
                    })
                );
                setLocalizedTickets(translated);
            } else {
                const localized = tickets.map((t: any) => ({
                    ...t,
                    category: categoryMap[t.category.toLowerCase()] || t.category,
                    description: t.description,
                }));
                setLocalizedTickets(localized);
            }
        };
        doTranslate();
    }, [locale, tickets]);

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    const getItemName = (item: OrderItem) => {
        if (item.type === "ticket") {
            const tk = localizedTickets.find((t) => t.id === item.id);
            return tk?.category || item.name || "Ticket";
        }
        return item.name || "Merchandise";
    };

    const getTotalTickets = (items: OrderItem[]) =>
        items.filter((i) => i.type === "ticket").reduce((sum, i) => sum + i.quantity, 0);

    const TICKET_DISCOUNT_PRICE: Record<string, number> = {
        adult: import.meta.env.VITE_ADULT_DISCOUNT,
        child: import.meta.env.VITE_CHILD_DISCOUNT,
    };

    const updateTicketPrices = (items: OrderItem[]): OrderItem[] => {
        const ticketQuantities: Record<number, number> = {};
        items
            .filter((i) => i.type === "ticket")
            .forEach((i) => {
                ticketQuantities[i.id] = (ticketQuantities[i.id] || 0) + i.quantity;
            });

        return items.map((item) => {
            if (item.type === "ticket") {
                const tk = localizedTickets.find((t) => t.id === item.id);
                const localizedCategory = tk?.category.toLowerCase() || "";
                const englishCategory = categoryReverseMap[localizedCategory] || localizedCategory;
                const categoryQuantity = ticketQuantities[item.id] || 0;
                if (categoryQuantity >= 20 && TICKET_DISCOUNT_PRICE[englishCategory]) {
                    return { ...item, price: TICKET_DISCOUNT_PRICE[englishCategory] };
                }
                return { ...item, price: tk?.price || item.price };
            }
            return item;
        });
    };

    const handleAdd = (payload: { id: number; type: "ticket" | "merch"; price: number; name?: string }) => {
        setOrderItems((prev) => {
            let newItems: OrderItem[];

            if (payload.type === "merch") {
                const merch = merchandises.find((m) => m.id === payload.id);
                if (!merch) {
                    toast.error(t("merch.notfound"));
                    return prev;
                }
                const totalStock = merch.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                const exist = prev.find((p) => p.id === payload.id && p.type === "merch" && !p.variantKey);
                const currentQuantity = exist ? exist.quantity : 0;
                const newQuantity = currentQuantity + 1;

                if (newQuantity > totalStock) {
                    toast.error(t("checkout.insufficientStock"));
                    return prev;
                }

                if (exist) {
                    newItems = prev.map((p) =>
                        p.id === payload.id && p.type === "merch" && !p.variantKey
                            ? { ...p, quantity: newQuantity }
                            : p
                    );
                } else {
                    newItems = [
                        ...prev,
                        {
                            id: payload.id,
                            type: "merch",
                            price: payload.price,
                            quantity: 1,
                            name: payload.name,
                        } as OrderItem,
                    ];
                }
            } else {
                const exist = prev.find((p) => p.id === payload.id && p.type === payload.type && !p.variantKey);
                if (exist) {
                    newItems = prev.map((p) =>
                        p.id === payload.id && p.type === payload.type && !p.variantKey
                            ? { ...p, quantity: p.quantity + 1 }
                            : p
                    );
                } else {
                    newItems = [
                        ...prev,
                        {
                            id: payload.id,
                            type: payload.type,
                            price: payload.price,
                            quantity: 1,
                            name: payload.name,
                        } as OrderItem,
                    ];
                }
            }

            return updateTicketPrices(newItems);
        });
    };

    const handleAddMerch = ({ merch, color, size, note, quantity }: {
        merch: Merch;
        color: string;
        size: string;
        note: string;
        quantity: number;
    }) => {
        const variantKey = `${merch.id}-${color}-${size}`;
        const variant = merch.variants.find((v) => v.color === color && v.size === size);

        if (!variant || variant.stock < quantity) {
            toast.error(t("checkout.insufficientStock"));
            return;
        }

        let finalPrice = merch.price;
        const priceXL = import.meta.env.VITE_SHIRT_PRICE;

        if (size?.toUpperCase() === "XL") {
            finalPrice += Number(priceXL);
        }

        setOrderItems((prev) => {
            const exist = prev.find((p) => p.variantKey === variantKey && p.type === "merch");
            let newItems: OrderItem[];

            if (exist) {
                const newQuantity = exist.quantity + quantity;
                if (variant.stock < newQuantity) {
                    toast.error(t("checkout.insufficientStock"));
                    return prev;
                }
                newItems = prev.map((p) =>
                    p.variantKey === variantKey && p.type === "merch"
                        ? { ...p, quantity: newQuantity, note, price: finalPrice }
                        : p
                );
            } else {
                newItems = [
                    ...prev,
                    {
                        id: merch.id,
                        type: "merch" as const,
                        price: finalPrice,
                        quantity,
                        name: merch.product_name,
                        color,
                        size,
                        note,
                        variantKey,
                    } as OrderItem,
                ];
            }

            return updateTicketPrices(newItems);
        });

        setMerchModal(null);
    };


    const handleDecrease = (id: number, type: "ticket" | "merch", variantKey?: string) => {
        setOrderItems((prev) => {
            const updatedItems = prev
                .map((p) => {
                    if (type === "merch" && variantKey) {
                        return p.variantKey === variantKey && p.type === type
                            ? { ...p, quantity: p.quantity - 1 }
                            : p;
                    }
                    return p.id === id && p.type === type && !p.variantKey
                        ? { ...p, quantity: p.quantity - 1 }
                        : p;
                })
                .filter((p) => p.quantity > 0);
            return updateTicketPrices(updatedItems);
        });
    };

    const handleIncrease = (id: number, type: "ticket" | "merch", variantKey?: string) => {
        if (type === "merch" && variantKey) {
            setOrderItems((prev) => {
                const updatedItems = prev.map((p) => {
                    if (p.variantKey === variantKey && p.type === "merch") {
                        const merch = merchandises.find((m) => m.id === p.id);
                        if (merch) {
                            const variant = merch.variants.find(
                                (v) => v.color === p.color && v.size === p.size
                            );
                            const stock = variant?.stock || 0;
                            if (p.quantity < stock) {
                                return { ...p, quantity: p.quantity + 1 };
                            } else {
                                toast.error(t("checkout.insufficientStock"));
                                return p;
                            }
                        }
                    }
                    return p;
                });
                return updateTicketPrices(updatedItems);
            });
        } else {
            handleAdd({
                id,
                type,
                price: type === "ticket" ? tickets.find((t) => t.id === id)?.price || 0 : 0,
                name: type === "ticket" ? localizedTickets.find((t) => t.id === id)?.category : undefined,
            });
        }
    };

    const handleSetLang = (lang: string) => {
        if (lang === "id" || lang === "en") {
            setLang(lang);
        }
    };

    const openMerchModal = (merch: Merch) => {
        const firstVariant = merch.variants?.[0];
        if (!firstVariant) {
            toast.error(t("checkout.noVariants"));
            return;
        }
        setMerchModal({
            merch,
            color: firstVariant.color || "",
            size: firstVariant.size || "",
            note: "",
            quantity: 1,
        });
    };

    const total = useMemo(
        () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [orderItems]
    );

    const handleCheckout = () => {
        if (!auth?.user?.id) {
            toast.error(t("checkout.unauthenticated"));
            return;
        }

        setLoading(true);

        const ticketItems = orderItems.filter((item) => item.type === "ticket");
        const merchItems = orderItems.filter((item) => item.type === "merch");

        const payload = {
            user_id: (auth as any).user.id,
            total_price: total,
            type: ticketItems.length > 0 && merchItems.length > 0 ? "mixed" : ticketItems.length > 0 ? "ticket" : "merchandise",
            channel: "online",
            items: orderItems.map((item) => ({
                item_type: item.type === "ticket" ? "ticket" : "product",
                item_name: getItemName(item),
                item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                color: item.color,
                size: item.size,
                note: item.note,
            })),
            ticket_details: ticketItems.map((item) => {
                const ticket = localizedTickets.find((t) => t.id === item.id);
                return {
                    ticket_id: ticket?.ticket_id || "",
                    ticket_category_id: item.id,
                    buyer_name: (auth as any).user.name,
                    phone: (auth as any).user.phone || "",
                    price: item.price,
                    quantity: item.quantity,
                };
            }),
        };

        router.post(route("checkout.store"), payload, {
            onSuccess: () => {
                setOrderItems([]);
                router.visit(route("checkout.history"));
            },
            onError: (errors) => {
                toast.error(t("checkout.failed"));
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 px-4 lg:px-20">
            <Head title="Checkout" />
            <AppNavbar lang={lang} setLang={handleSetLang} forceSolid={true} />

            {/* Left Side */}
            <div className="pt-20 lg:pt-24 lg:mb-10">
                <div className="space-y-6 bg-white border rounded-lg p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4">{t("checkout.ticket")}</h2>
                    <div className="grid gap-4">
                        {localizedTickets.length > 0 ? (
                            localizedTickets.map((ticket) => {
                                const exist = orderItems.find((p) => p.id === ticket.id && p.type === "ticket");
                                return (
                                    <div key={ticket.id} className="border rounded-lg p-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{capitalizeFirst(ticket.category)}</h3>
                                                <p>{formatCurrency(ticket.price)}</p>
                                            </div>
                                            {!exist ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleAdd({
                                                            id: ticket.id,
                                                            type: "ticket" as const,
                                                            price: ticket.price,
                                                            name: ticket.category,
                                                        })
                                                    }
                                                    className="px-12 py-0 sm:px-0 sm:py-3 w-1/4 border-gray-300 hover:bg-primary/5"
                                                >
                                                    {t("checkout.add")}
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDecrease(ticket.id, "ticket")}
                                                        className="px-2 py-2 border rounded hover:bg-gray-100"
                                                    >
                                                        <LuMinus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center">{exist.quantity}</span>
                                                    <button
                                                        onClick={() => handleIncrease(ticket.id, "ticket")}
                                                        className="px-2 py-2 border rounded hover:bg-gray-100"
                                                    >
                                                        <LuPlus size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <Description
                                            description={ticket.description}
                                            lang={lang}
                                            translate={translateRef.current}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500">{t("checkout.noTickets")}</p>
                        )}
                    </div>

                    {merchandises.length > 0 && (
                        <>
                            <h2 className="text-xl font-bold mt-8 mb-4">{t("checkout.merch")}</h2>
                            <div className="grid gap-4">
                                {merchandises.map((merch) => {
                                    const existingItems = orderItems.filter((p) => p.id === merch.id && p.type === "merch");
                                    const hasVariants = merch.variants.some((v) => v.color || v.size);
                                    return (
                                        <div key={merch.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{merch.product_name}</h3>
                                                    <p>{formatCurrency(merch.price)}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (hasVariants) {
                                                            openMerchModal(merch);
                                                        } else {
                                                            handleAdd({
                                                                id: merch.id,
                                                                type: "merch",
                                                                price: merch.price,
                                                                name: merch.product_name,
                                                            });
                                                        }
                                                    }}
                                                    className="px-12 py-0 sm:px-0 sm:py-3 w-1/4 border-gray-300 hover:bg-primary/5"
                                                >
                                                    {t("checkout.add")}
                                                </Button>
                                            </div>

                                            {existingItems.length > 0 && (
                                                <div className="border-t pt-3 space-y-2 mt-2">
                                                    <p className="text-sm font-medium text-gray-700">{t("checkout.cart")}</p>
                                                    {existingItems.map((item, index) => (
                                                        <div key={`${item.variantKey}-${index}`} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    {item.color && (
                                                                        <div className="flex items-center gap-1">
                                                                            <div
                                                                                className="w-4 h-4 rounded-full border border-gray-400"
                                                                                style={{ backgroundColor: item.color }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {item.size && <span>Size {item.size}</span>}
                                                                </div>
                                                                {item.note && (
                                                                    <p className="text-sm text-gray-500 mt-1">{t("checkout.note")}: {item.note}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleDecrease(item.id, "merch", item.variantKey)}
                                                                    className="px-2 py-2 border rounded hover:bg-gray-100"
                                                                >
                                                                    <LuMinus size={16} />
                                                                </button>
                                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => handleIncrease(item.id, "merch", item.variantKey)}
                                                                    className="px-2 py-2 border rounded hover:bg-gray-100"
                                                                >
                                                                    <LuPlus size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Side */}
            <div className="lg:pt-24 mb-8">
                <div className="bg-white border rounded-lg p-6 h-fit lg:sticky lg:top-24">
                    <h3 className="font-semibold text-lg mb-4">{t("checkout.detail")}</h3>

                    {orderItems.length === 0 ? (
                        <p className="text-gray-500">{t("checkout.empty")}</p>
                    ) : (
                        <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {orderItems.map((item, index) => (
                                <li
                                    key={`${item.type}-${item.variantKey || item.id}-${index}`}
                                    className="flex justify-between items-start border-b pb-3"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{capitalizeFirst(getItemName(item))}</p>
                                        <div className="flex items-center gap-8">
                                            {item.type === "merch" && (item.color || item.size) && (
                                                <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                                    {item.color && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-gray-400"
                                                                style={{ backgroundColor: item.color }}
                                                            />
                                                        </span>
                                                    )}
                                                    {item.size && <span>Size {item.size}</span>}
                                                </div>
                                            )}
                                            {item.note && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {t("checkout.note")}: {item.note}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatCurrency(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="font-medium text-right">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Total */}
                    <div className="flex justify-between font-semibold text-lg mt-6">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>

                    {/* Checkbox validation */}
                    <div className="flex items-start gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="ageConfirm"
                            checked={isAgeConfirmed}
                            onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                            className="mt-1"
                            required
                        />
                        <label htmlFor="ageConfirm" className="text-sm text-gray-600 cursor-pointer">
                            {t("ticket.validation")}
                        </label>
                    </div>

                    {/* Checkout Button */}
                    <Button
                        className="w-full mt-4"
                        disabled={orderItems.length === 0 || loading || !isAgeConfirmed}
                        onClick={handleCheckout}
                    >
                        {loading ? (
                            <>
                                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                Checkout
                            </>
                        ) : (
                            "Checkout"
                        )}
                    </Button>
                </div>
            </div>

            <ModalMerchandiseSelection
                isOpen={!!merchModal}
                merchModal={merchModal}
                setMerchModal={setMerchModal}
                handleAddMerch={handleAddMerch}
            />
        </div>
    );
}
