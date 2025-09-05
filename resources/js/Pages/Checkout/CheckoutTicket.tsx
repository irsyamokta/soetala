import { useState, useEffect, useMemo, useRef } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { LuMinus, LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import Button from "@/Components/ui/button/Button";
import AppNavbar from "@/Components/app/AppNavbar";
import { formatCurrency } from "@/utils/formatCurrency";
import capitalizeFirst from "@/utils/capitalize";
import { ModalMerchandiseSelection } from "./Components/modal/ModalMerchandiseSelection";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type Ticket = {
    id: number;
    category: string;
    online_price: number;
};

type MerchVariant = {
    color: string;
    size: string;
    stock: number;
};

type Merch = {
    id: number;
    product_name: string;
    price: number;
    variants: MerchVariant[];
};

type OrderItem = {
    id: number;
    type: "ticket" | "merch";
    price: number;
    quantity: number;
    name?: string;
    color?: string;
    size?: string;
    note?: string;
    variantKey?: string;
};

type MerchModalData = {
    merch: Merch;
    color: string;
    size: string;
    note: string;
    quantity: number;
};

export default function CheckoutTicket({
    initialTicket,
    initialMerch,
    tickets = [],
    merchandises = [],
}: {
    initialTicket?: Ticket;
    initialMerch?: Merch;
    tickets: Ticket[];
    merchandises: Merch[];
}) {
    const [lang, setLang] = useState<"id" | "en">("id");
    const { locale, auth } = usePage().props;
    const t = useTranslate();
    const { translate } = useApiTranslate();
    const [loading, setLoading] = useState(false);

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

    const [localizedTickets, setLocalizedTickets] = useState<Ticket[]>(tickets);
    const [merchModal, setMerchModal] = useState<MerchModalData | null>(null);

    useEffect(() => {
        const doTranslate = async () => {
            if (!tickets) return;

            if (locale === "en") {
                const translated = await Promise.all(
                    tickets.map(async (t: any) => ({
                        ...t,
                        category: await translate(t.category, "en"),
                    }))
                );
                setLocalizedTickets(translated);
            } else {
                const localized = tickets.map((t: any) => ({
                    ...t,
                    category: categoryMap[t.category.toLowerCase()] || t.category,
                }));
                setLocalizedTickets(localized);
            }
        };
        doTranslate();
    }, [locale, tickets]);

    const initialOrder: OrderItem[] = useMemo(() => {
        const arr: OrderItem[] = [];
        if (initialTicket) {
            arr.push({
                id: initialTicket.id,
                type: "ticket",
                price: initialTicket.online_price,
                quantity: 1,
            });
        }
        if (initialMerch) {
            const firstVariant = initialMerch.variants?.[0];
            arr.push({
                id: initialMerch.id,
                type: "merch",
                price: initialMerch.price,
                quantity: 1,
                name: initialMerch.product_name,
                color: firstVariant?.color || "",
                size: firstVariant?.size || "",
                note: "",
                variantKey: `${initialMerch.id}-${firstVariant?.color || ""}-${firstVariant?.size || ""}`,
            });
        }
        return arr;
    }, [initialTicket, initialMerch]);

    const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrder);

    const getItemName = (item: OrderItem) => {
        if (item.type === "ticket") {
            const tk = localizedTickets.find((t) => t.id === item.id);
            if (tk) return tk.category;
            const raw = tickets.find((t) => t.id === item.id)?.category;
            return raw ?? item.name ?? "Ticket";
        }
        const merch = merchandises.find((m) => m.id === item.id);
        return merch?.product_name ?? item.name ?? "Merchandise";
    };

    const handleAdd = (payload: { id: number; type: "ticket" | "merch"; price: number; name?: string }) => {
        setOrderItems((prev) => {
            const exist = prev.find((p) => p.id === payload.id && p.type === payload.type);
            if (exist) {
                return prev.map((p) =>
                    p.id === payload.id && p.type === payload.type ? { ...p, quantity: p.quantity + 1 } : p
                );
            }
            return [
                ...prev,
                {
                    id: payload.id,
                    type: payload.type,
                    price: payload.price,
                    quantity: 1,
                    name: payload.type === "merch" ? payload.name : undefined,
                },
            ];
        });
    };

    const handleAddMerch = (merchData: MerchModalData) => {
        const variantKey = `${merchData.merch.id}-${merchData.color}-${merchData.size}`;

        setOrderItems((prev) => {
            const exist = prev.find((p) => p.variantKey === variantKey && p.type === "merch");
            if (exist) {
                return prev.map((p) =>
                    p.variantKey === variantKey && p.type === "merch"
                        ? { ...p, quantity: p.quantity + merchData.quantity, note: merchData.note }
                        : p
                );
            }
            return [
                ...prev,
                {
                    id: merchData.merch.id,
                    type: "merch",
                    price: merchData.merch.price,
                    quantity: merchData.quantity,
                    name: merchData.merch.product_name,
                    color: merchData.color,
                    size: merchData.size,
                    note: merchData.note,
                    variantKey,
                },
            ];
        });
        setMerchModal(null);
    };

    const handleDecrease = (id: number, type: "ticket" | "merch", variantKey?: string) => {
        setOrderItems((prev) =>
            prev
                .map((p) => {
                    if (type === "merch" && variantKey) {
                        return p.variantKey === variantKey && p.type === type
                            ? { ...p, quantity: p.quantity - 1 }
                            : p;
                    }
                    return p.id === id && p.type === type
                        ? { ...p, quantity: p.quantity - 1 }
                        : p;
                })
                .filter((p) => p.quantity > 0)
        );
    };

    const handleIncrease = (id: number, type: "ticket" | "merch", variantKey?: string) => {
        if (type === "merch" && variantKey) {
            setOrderItems(prev =>
                prev.map(p => {
                    if (p.variantKey === variantKey && p.type === "merch") {
                        const merch = merchandises.find(m => m.id === p.id);
                        if (merch) {
                            const variant = merch.variants?.find(v => v.color === p.color && v.size === p.size);
                            const stock = variant?.stock || 0;
                            if (p.quantity < stock) {
                                return { ...p, quantity: p.quantity + 1 };
                            }
                        }
                    }
                    return p;
                })
            );
        } else {
            handleAdd({ id, type, price: 0, name: "" });
        }
    };

    const handleSetLang = (lang: string) => {
        if (lang === "id" || lang === "en") {
            setLang(lang);
        }
    };

    const openMerchModal = (merch: Merch) => {
        const firstVariant = merch.variants?.[0];
        setMerchModal({
            merch,
            color: firstVariant?.color || "",
            size: firstVariant?.size || "",
            note: "",
            quantity: 1,
        });
    };

    const total = useMemo(
        () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [orderItems]
    );

    const handleCheckout = () => {
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
            ticket_details: ticketItems.map((item) => ({
                ticket_id: item.id,
                buyer_name: (auth as any).user.name,
                phone: (auth as any).user.phone,
                ticket_type: tickets.find((t) => t.id === item.id)?.category.toLowerCase() || "adult",
                price: item.price,
                quantity: item.quantity,
            })),
        };

        router.post(route("checkout.store"), payload, {
            // onSuccess: () => {
            //     toast.success(t("checkout.success"));
            //     setOrderItems([]);
            // },
            // onError: (errors) => {
            //     toast.error(t("checkout.error"));
            //     console.error(errors);
            // },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 px-4 lg:px-20">
            <Head title="Checkout" />
            <AppNavbar lang={lang} setLang={handleSetLang} forceSolid={true} />

            {/* Left Side */}
            <div className="pt-20 lg:pt-24">
                <div className="space-y-6 bg-white border rounded-lg p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4">{t("checkout.ticket")}</h2>
                    <div className="grid gap-4">
                        {localizedTickets.map((ticket) => {
                            const exist = orderItems.find((p) => p.id === ticket.id && p.type === "ticket");
                            return (
                                <div key={ticket.id} className="border rounded-lg p-4 flex justify-between items-center gap-2">
                                    <div>
                                        <h3 className="font-semibold">{capitalizeFirst(ticket.category)}</h3>
                                        <p>{formatCurrency(ticket.online_price)}</p>
                                    </div>
                                    {!exist ? (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleAdd({
                                                    id: ticket.id,
                                                    type: "ticket",
                                                    price: ticket.online_price,
                                                })
                                            }
                                            className="w-1/4 border-gray-300 hover:bg-primary/5"
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
                            );
                        })}
                    </div>

                    {merchandises.length > 0 && (
                        <h2 className="text-xl font-bold mt-8 mb-4">{t("checkout.merch")}</h2>
                    )}
                    <div className="grid gap-4">
                        {merchandises.map((merch) => {
                            const existingItems = orderItems.filter((p) => p.id === merch.id && p.type === "merch");
                            return (
                                <div key={merch.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{merch.product_name}</h3>
                                            <p>{formatCurrency(merch.price)}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => openMerchModal(merch)}
                                            className="w-1/4 border-gray-300 hover:bg-primary/5"
                                        >
                                            {t("checkout.add")}
                                        </Button>
                                    </div>

                                    {/* Show existing variants in cart */}
                                    {existingItems.length > 0 && (
                                        <div className="border-t pt-3 space-y-2 mt-2">
                                            <p className="text-sm font-medium text-gray-700">In Cart:</p>
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
                                                            <p className="text-sm text-gray-500 mt-1">Note: {item.note}</p>
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
                </div>
            </div>

            {/* Right Side */}
            <div className="lg:pt-24">
                <div className="bg-white border rounded-lg p-6 h-fit">
                    <h3 className="font-semibold text-lg mb-4">{t("checkout.detail")}</h3>
                    {orderItems.length === 0 ? (
                        <p className="text-gray-500">{t("checkout.empty")}</p>
                    ) : (
                        <ul className="space-y-4">
                            {orderItems.map((item, index) => (
                                <li key={`${item.type}-${item.variantKey || item.id}-${index}`} className="flex justify-between items-start border-b pb-3">
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
                                                <p className="text-sm text-gray-500 mt-1">Note: {item.note}</p>
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

                    <div className="flex justify-between font-semibold text-lg mt-6">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>

                    <Button
                        className="w-full mt-4"
                        disabled={orderItems.length === 0 || loading}
                        onClick={handleCheckout}
                    >
                        {loading ? (
                            <>
                                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                Loading...
                            </>
                        ) : (
                            "Checkout"
                        )}
                    </Button>
                </div>
            </div>

            {/* Modal for Merchandise Selection */}
            <ModalMerchandiseSelection
                isOpen={!!merchModal}
                merchModal={merchModal}
                setMerchModal={setMerchModal}
                handleAddMerch={handleAddMerch}
            />
        </div>
    );
}
