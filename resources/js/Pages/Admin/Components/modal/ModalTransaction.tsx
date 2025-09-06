import { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";
import { ModalMerchandiseSelection } from "./ModalMerchandiseSelection";
import { formatCurrency } from "@/utils/formatCurrency";
import { LuMinus, LuPlus } from "react-icons/lu";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface Event {
    id: string;
    title: string;
    categories: TicketCategory[];
}

interface TicketCategory {
    id: string;
    category_name: string;
    price: number;
}

interface Merch {
    id: string;
    product_name: string;
    price: number;
    category_name: string;
    variants: Variant[];
}

interface Variant {
    id?: string;
    color?: string;
    size?: string;
    stock: number;
}

interface OrderItem {
    type: "ticket" | "product";
    id: string;
    price: number;
    quantity: number;
    category_name?: string;
    product_name?: string;
    color?: string;
    size?: string;
    note?: string;
    variantKey?: string;
}

interface ModalTransactionProps {
    isOpen: boolean;
    onClose: () => void;
}

const colorMap: Record<string, string> = {
    "#ffffff": "Putih",
    "#000000": "Hitam",
    "#ff0000": "Merah",
    "#0914B7FF": "Navy",
};

export const ModalTransaction = ({ isOpen, onClose }: ModalTransactionProps) => {
    const { props } = usePage();
    const events = (props.events || []) as Event[];
    const merchandises = (props.merchandises || []) as Merch[];
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [merchModal, setMerchModal] = useState<Merch | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const { data, setData, reset } = useForm({
        buyer_name: "",
        payment_method: "cash",
    });

    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedEvent(null);
            setOrderItems([]);
            setServerErrors({});
        }
    }, [isOpen, reset]);

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleAddItem = (
        type: "ticket" | "product",
        id: string,
        price: number,
        quantityToAdd: number = 1,
        extra: Partial<OrderItem>
    ) => {
        setOrderItems((prev) => {
            const variantKey = extra.variantKey;
            const exist = prev.find(
                (p) =>
                    p.type === type &&
                    p.id === id &&
                    (type === "ticket" || p.variantKey === variantKey)
            );
            if (exist) {
                return prev.map((p) =>
                    p === exist ? { ...p, quantity: p.quantity + quantityToAdd, note: extra.note || p.note } : p
                );
            }
            return [...prev, { type, id, price, quantity: quantityToAdd, ...extra }];
        });
    };

    const handleDecrease = (id: string, type: "ticket" | "product", variantKey?: string) => {
        setOrderItems((prev) =>
            prev
                .map((p) => {
                    if (p.type === type && p.id === id && (variantKey ? p.variantKey === variantKey : true)) {
                        return { ...p, quantity: p.quantity - 1 };
                    }
                    return p;
                })
                .filter((p) => p.quantity > 0)
        );
    };

    const handleIncrease = (id: string, type: "ticket" | "product", variantKey?: string) => {
        setOrderItems((prev) =>
            prev.map((p) => {
                if (p.type === type && p.id === id && (variantKey ? p.variantKey === variantKey : true)) {
                    if (type === "ticket") {
                        return { ...p, quantity: p.quantity + 1 };
                    }
                    if (type === "product") {
                        const merch = merchandises.find((m) => m.id === id);
                        if (merch) {
                            const variant = merch.variants.find((v) => v.color === p.color && v.size === p.size);
                            if (variant && p.quantity < variant.stock) {
                                return { ...p, quantity: p.quantity + 1 };
                            }
                        }
                    }
                }
                return p;
            })
        );
    };

    const handleAddMerch = ({ merch, color, size, note, quantity }: { merch: Merch; color: string; size: string; note: string; quantity: number }) => {
        const variantKey = `${merch.id}-${color}-${size}`;
        const extra = {
            product_name: merch.product_name,
            color,
            size,
            note,
            variantKey,
        };
        handleAddItem("product", merch.id, merch.price, quantity, extra);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        const ticketItems = orderItems.filter((item) => item.type === "ticket");
        const merchItems = orderItems.filter((item) => item.type === "product");
        const type =
            ticketItems.length > 0 && merchItems.length > 0
                ? "mixed"
                : ticketItems.length > 0
                    ? "ticket"
                    : "merchandise";

        const payload = {
            buyer_name: data.buyer_name,
            payment_method: data.payment_method,
            total_price: total,
            type,
            channel: "offline",
            items: orderItems.map((item) => ({
                item_type: item.type,
                item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                color: item.color || "",
                size: item.size || "",
                note: item.note || "",
            })),
            ticket_details: ticketItems.map((item) => ({
                ticket_category_id: item.id,
                buyer_name: data.buyer_name,
                price: item.price,
                quantity: item.quantity,
            })),
        };

        router.post(route("transaction.store"), payload, {
            onSuccess: () => {
                toast.success("Transaksi berhasil ditambahkan");
                reset();
                setOrderItems([]);
                setSelectedEvent(null);
                onClose();
            },
            onError: (errors) => {
                const normalizedErrors: Record<string, string> = {};
                Object.entries(errors).forEach(([key, val]) => {
                    const newKey = key.replace(/\[(\d+)\]/g, '.$1');
                    normalizedErrors[newKey] = val as string;
                });
                setServerErrors(normalizedErrors);
                console.error(errors);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] m-4">
            <div className="no-scrollbar relative w-full max-w-[800px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                <h4 className="text-2xl font-semibold mb-6">Tambah Transaksi</h4>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div>
                        <Label required={true}>Nama Pembeli</Label>
                        <Input
                            value={data.buyer_name}
                            onChange={(e) => setData("buyer_name", e.target.value)}
                            placeholder="Masukkan nama pembeli"
                        />
                        {serverErrors.buyer_name && <p className="text-xs text-red-500 mt-1">{serverErrors.buyer_name}</p>}
                    </div>
                    <div>
                        <Label required={true}>Daftar Tiket</Label>
                        <Select
                            value={selectedEvent?.id || ""}
                            onChange={(val) => setSelectedEvent(events.find((e) => e.id === val) || null)}
                            options={events.map((e) => ({ value: e.id, label: e.title }))}
                            placeholder="Pilih event"
                        />
                        {serverErrors.items && <p className="text-xs text-red-500 mt-1">{serverErrors.items}</p>}
                    </div>
                    {selectedEvent && (
                        <div>
                            <h5 className="text-lg font-semibold mb-3">Pembelian Tiket</h5>
                            <div className="grid gap-3">
                                {selectedEvent.categories.map((cat) => {
                                    const exist = orderItems.find((p) => p.type === "ticket" && p.id === cat.id);
                                    return (
                                        <div key={cat.id} className="border rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{cat.category_name}</p>
                                                <p className="text-sm text-gray-600">{formatCurrency(cat.price)}</p>
                                            </div>
                                            {!exist ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddItem("ticket", cat.id, cat.price, 1, { category_name: cat.category_name })
                                                    }
                                                    className="px-4 py-3 border rounded-lg text-sm hover:bg-gray-100"
                                                >
                                                    Tambah
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDecrease(cat.id, "ticket")}
                                                        className="px-2 py-1 border rounded hover:bg-gray-100"
                                                    >
                                                        <LuMinus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center">{exist.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleIncrease(cat.id, "ticket")}
                                                        className="px-2 py-1 border rounded hover:bg-gray-100"
                                                    >
                                                        <LuPlus size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div>
                        <h5 className="text-lg font-semibold mb-3">Pembelian Merchandise</h5>
                        <div className="grid gap-3">
                            {merchandises.map((merch) => {
                                const existingItems = orderItems.filter((p) => p.type === "product" && p.id === merch.id);
                                return (
                                    <div key={merch.id} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{merch.product_name}</p>
                                                <p className="text-sm text-gray-600">{formatCurrency(merch.price)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setMerchModal(merch)}
                                                className="px-4 py-3 border rounded-lg text-sm hover:bg-gray-100"
                                            >
                                                Tambah
                                            </button>
                                        </div>
                                        {existingItems.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {existingItems.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                {item.color && (
                                                                    <div
                                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                                        style={{ backgroundColor: item.color }}
                                                                    />
                                                                )}
                                                                {item.size && <span>Ukuran {item.size}</span>}
                                                            </div>
                                                            {item.note && <p className="text-sm text-gray-500 mt-1">Note: {item.note}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDecrease(merch.id, "product", item.variantKey)}
                                                                className="px-2 py-1 border rounded hover:bg-gray-100"
                                                            >
                                                                <LuMinus size={16} />
                                                            </button>
                                                            <span className="w-8 text-center">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleIncrease(merch.id, "product", item.variantKey)}
                                                                className="px-2 py-1 border rounded hover:bg-gray-100"
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
                    <div>
                        <Label required={true}>Metode Pembayaran</Label>
                        <Select
                            value={data.payment_method}
                            onChange={(val) => setData("payment_method", val)}
                            options={[
                                { value: "cash", label: "Cash" },
                                { value: "qris", label: "QRIS" },
                            ]}
                        />
                        {serverErrors.payment_method && <p className="text-xs text-red-500 mt-1">{serverErrors.payment_method}</p>}
                    </div>
                    <div>
                        <h5 className="text-lg font-semibold mb-3">Detail Pesanan</h5>
                        {orderItems.length === 0 ? (
                            <p className="text-gray-500">Belum ada item ditambahkan</p>
                        ) : (
                            <ul className="space-y-2">
                                {orderItems.map((item, index) => (
                                    <li key={index} className="flex justify-between text-sm border-b pb-2">
                                        <span>
                                            {item.type === "ticket" ? item.category_name : item.product_name}{" "}
                                            {item.size || item.color
                                                ? `(${item.size ? item.size + ", " : ""}${colorMap[item.color || ""] || item.color})`
                                                : ""}{" "}
                                            x {item.quantity}
                                        </span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex justify-between font-semibold mt-4">
                            <span>Subtotal</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
            <ModalMerchandiseSelection
                isOpen={!!merchModal}
                onClose={() => setMerchModal(null)}
                merch={merchModal}
                handleAddMerch={handleAddMerch}
            />
        </Modal>
    );
};
