import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import AppNavbar from "@/Components/app/AppNavbar";
import HeaderSection from "@/Components/card/HeaderCard";
import Badge from "@/Components/ui/badge/Badge";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import capitalizeFirst from "@/utils/capitalize";
import { EmptyTransaction } from "./Components/card/EmptyTransaction";

type TransactionItem = {
    id: string;
    item_type: "ticket" | "product";
    item_id: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    note?: string;
    item_name: string;
};

type TicketOrder = {
    id: string;
    ticket_id: string;
    buyer_name: string;
    phone: string | null;
    ticket_type: "adult" | "child";
    price: number;
    qr_code: string | null;
    category_name?: string;
};

type Transaction = {
    id: string;
    type: "ticket" | "merchandise" | "mixed";
    total_price: number;
    status: "pending" | "paid" | "canceled" | "expired";
    status_label: string;
    created_at: string;
    snap_token?: string;
    snap_token_expired_at?: string;
    items: TransactionItem[];
    ticket_orders: TicketOrder[];
};

type Props = {
    transactions: Transaction[];
    snap_token?: string;
    transaction_id?: string;
};

export default function TransactionHistory({ transactions, snap_token, transaction_id }: Props) {
    const [lang, setLang] = useState<"id" | "en">("id");
    const [transaction, setTransaction] = useState<Transaction[]>(transactions || []);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [paymentAttempted, setPaymentAttempted] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSnapLoaded, setIsSnapLoaded] = useState<boolean>(false);

    const { locale } = usePage().props;
    const t = useTranslate();
    const { translate } = useApiTranslate();

    const categoryMap: Record<string, string> = {
        adult: "Dewasa",
        child: "Anak",
    };

    const statusMap: Record<string, string> = {
        pending: "Menunggu",
        paid: "Dibayar",
        canceled: "Dibatalkan",
        expired: "Kedaluwarsa",
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const hasPending = transaction.some((t) => t.status === "pending");
            if (hasPending) {
                router.reload({ only: ["transactions"] });
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [transaction]);

    useEffect(() => {
        const doTranslate = async () => {
            if (locale === "en") {
                const translated = await Promise.all(
                    transactions.map(async (t: Transaction) => {
                        const items = await Promise.all(
                            t.items.map(async (i) => ({
                                ...i,
                                item_name: await translate(i.item_name, "en"),
                            }))
                        );
                        return {
                            ...t,
                            status_label: capitalizeFirst(t.status),
                            items,
                            ticket_orders: t.ticket_orders.map((order) => ({
                                ...order,
                                category_name: order.category_name || categoryMap[order.ticket_type] || "Ticket",
                            })),
                        };
                    })
                );
                setTransaction(translated);
            } else {
                const localized = transactions.map((t) => ({
                    ...t,
                    status_label: statusMap[t.status] || capitalizeFirst(t.status),
                    items: t.items.map((i) => ({
                        ...i,
                        item_name: i.item_name,
                    })),
                    ticket_orders: t.ticket_orders.map((order) => ({
                        ...order,
                        category_name: order.category_name || categoryMap[order.ticket_type] || "Ticket",
                    })),
                }));
                setTransaction(localized);
            }
        };
        doTranslate();
    }, [locale, transactions]);

    useEffect(() => {
        const loadSnapScript = () => {
            if (typeof window === "undefined" || (window as any).snap) {
                setIsSnapLoaded(true);
                return;
            }

            const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
            if (!clientKey) {
                setError("Kunci klien Midtrans tidak ditemukan. Silakan hubungi dukungan.");
                return;
            }

            const script = document.createElement("script");
            script.src =
                import.meta.env.VITE_APP_ENV === "production"
                    ? "https://app.midtrans.com/snap/snap.js"
                    : "https://app.sandbox.midtrans.com/snap/snap.js";
            script.setAttribute("data-client-key", clientKey);
            script.async = true;

            script.onload = () => {
                setIsSnapLoaded(true);
            };

            script.onerror = () => {
                setError("Gagal memuat Snap.js. Periksa koneksi atau coba lagi nanti.");
                setIsSnapLoaded(false);
            };

            document.body.appendChild(script);
        };

        loadSnapScript();
    }, []);

    useEffect(() => {
        if (snap_token && transaction_id && isSnapLoaded && (window as any).snap) {
            try {
                (window as any).snap.pay(snap_token, {
                    onSuccess: (result: any) => {
                        router.visit(route("checkout.history"), { method: "get" });
                    },
                    onPending: (result: any) => {
                        setPaymentAttempted((prev) => ({ ...prev, [transaction_id]: true }));
                        setIsLoading((prev) => ({ ...prev, [transaction_id]: false }));
                    },
                    onError: (result: any) => {
                        setError("Pembayaran gagal: " + (result?.message || "Unknown error"));
                        setPaymentAttempted((prev) => ({ ...prev, [transaction_id]: false }));
                        setIsLoading((prev) => ({ ...prev, [transaction_id]: false }));
                    },
                    onClose: () => {
                        setPaymentAttempted((prev) => ({ ...prev, [transaction_id]: true }));
                        setIsLoading((prev) => ({ ...prev, [transaction_id]: false }));
                    },
                });
            } catch (error) {
                setError("Gagal membuka popup pembayaran: " + (error instanceof Error ? error.message : "Unknown error"));
                setIsLoading((prev) => ({ ...prev, [transaction_id]: false }));
            }
        }
    }, [snap_token, transaction_id, isSnapLoaded]);

    const handleSetLang = (lang: string) => {
        if (lang === "id" || lang === "en") {
            setLang(lang);
        }
    };

    const handlePayNow = async (transactionId: string) => {
        setError(null);

        if (!isSnapLoaded || !(window as any).snap) {
            setError("Snap.js belum dimuat. Silakan coba lagi nanti.");
            return;
        }

        const trans = transaction.find((t) => t.id === transactionId);

        if (trans?.snap_token && !isExpired(trans)) {
            (window as any).snap.pay(trans.snap_token, {
                onSuccess: () => router.visit(route("checkout.history")),
                onPending: () => setPaymentAttempted((prev) => ({ ...prev, [transactionId]: true })),
                onError: () => setError("Pembayaran gagal."),
                onClose: () => setPaymentAttempted((prev) => ({ ...prev, [transactionId]: true })),
            });
        } else {
            setIsLoading((prev) => ({ ...prev, [transactionId]: true }));
            router.post(route("checkout.pay", { id: transactionId }), {}, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading((prev) => ({ ...prev, [transactionId]: false })),
            });
        }
    };

    const handleCancel = (transactionId: string) => {
        Swal.fire({
            title: t("transaction.confirm.cancel"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#014C8F",
            cancelButtonColor: "#d33",
            confirmButtonText: t("transaction.button.yes"),
            cancelButtonText: t("transaction.button.no"),
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise((resolve, reject) => {
                    router.post(
                        route("checkout.cancel", { id: transactionId }),
                        {},
                        {
                            preserveState: true,
                            onSuccess: () => {
                                resolve(true);
                            },
                            onError: (errors: any) => {
                                reject(errors);
                            },
                        }
                    );
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: t("transaction.success.cancel"),
                    text: t("transaction.message.cancel_success"),
                    icon: "success",
                    confirmButtonColor: "#014C8F"
                }).then(() => {
                    router.visit(route("checkout.history"), { method: "get" });
                });
            }
        }).catch((error) => {
            setError(t("transaction.error.cancel"));
            Swal.fire({
                title: t("transaction.error.title"),
                text: t("transaction.error.cancel"),
                icon: "error",
                confirmButtonColor: "#014C8F"
            });
        });
    };

    const isExpired = (trans: Transaction) => {
        return (
            trans.status === "expired" ||
            (trans.snap_token_expired_at && new Date(trans.snap_token_expired_at) < new Date())
        );
    };

    const getButtonText = (trans: Transaction) => {
        if (trans.snap_token && !isExpired(trans)) {
            return t("transaction.button.continue");
        }
        return t("transaction.button.payment");
    };

    return (
        <div className="px-4 lg:px-20 mb-8">
            <Head title={t("transaction.title")} />
            <AppNavbar lang={lang} setLang={handleSetLang} forceSolid={true} />
            <div className="pt-20 lg:pt-24">
                <HeaderSection title={t("transaction.title")} showButton={false} />
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {transaction.length === 0 ? (
                    <EmptyTransaction />
                ) : (
                    <div className="space-y-6 mt-4">
                        {transaction.map((trans) => (
                            <div key={trans.id} className="border rounded-2xl p-6 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">{trans.id}</h2>
                                        <p className="text-sm text-gray-500">
                                            {new Date(trans.created_at).toLocaleDateString(
                                                locale === "id" ? "id-ID" : "en-US",
                                                {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }
                                            )}
                                        </p>
                                    </div>
                                    <Badge
                                        className="px-4 py-2"
                                        color={
                                            trans.status === "pending"
                                                ? "warning"
                                                : trans.status === "paid"
                                                    ? "success"
                                                    : trans.status === "canceled" || trans.status === "expired"
                                                        ? "error"
                                                        : "light"
                                        }
                                    >
                                        {trans.status_label || capitalizeFirst(trans.status)}
                                    </Badge>
                                </div>
                                <h3 className="text-md font-semibold mb-2">
                                    {t("transaction.detail")}
                                </h3>
                                <ul className="space-y-3">
                                    {trans.items.map((item, index) => (
                                        <li
                                            key={`${item.id}-${index}`}
                                            className="flex justify-between items-start border-b pb-2"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{capitalizeFirst(item.item_name)}</p>
                                                {(item.color || item.size || item.note) && (
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
                                                        {item.note && <p>Note: {item.note}</p>}
                                                    </div>
                                                )}
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
                                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 mb-4 mt-4">
                                    <p className="text-xs sm:text-sm">
                                        <span className="text-red-500 font-bold">*{" "}</span>
                                        {t("transaction.note")}
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <h3 className="font-bold text-xl">Subtotal:</h3>
                                        <h1 className="font-bold text-xl">{formatCurrency(trans.total_price)}</h1>
                                    </div>
                                </div>
                                {trans.status === "pending" && !isExpired(trans) && (
                                    <div className="flex flex-col-reverse md:flex-row gap-4 mt-4">
                                        <Button
                                            variant="outline"
                                            className="md:w-1/2 border-primary text-primary hover:bg-gray-100"
                                            onClick={() => handleCancel(trans.id)}
                                            disabled={isLoading[trans.id]}
                                        >
                                            {t("transaction.button.cancel")}
                                        </Button>
                                        <Button
                                            className="md:w-1/2"
                                            onClick={() => handlePayNow(trans.id)}
                                            disabled={isLoading[trans.id]}
                                        >
                                            {isLoading[trans.id]
                                                ? t("transaction.button.loading")
                                                : getButtonText(trans)}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}