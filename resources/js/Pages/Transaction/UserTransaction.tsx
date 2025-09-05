import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
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
    variant_details?: {
        color?: string;
        size?: string;
        note?: string;
    };
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
};

type Transaction = {
    id: string;
    type: "ticket" | "merchandise" | "ticket,merchandise";
    total_price: number;
    status: "pending" | "paid" | "canceled";
    created_at: string;
    items: TransactionItem[];
    ticket_orders: TicketOrder[];
};

type Props = {
    transactions: Transaction[];
};

export default function TransactionHistory({ transactions }: Props) {
    const [lang, setLang] = useState<"id" | "en">("id");
    const [transaction, setTransaction] = useState<any[]>(transactions || []);

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
    };

    useEffect(() => {
        const doTranslate = async () => {
            if (locale === "en") {
                const translated = await Promise.all(
                    transactions.map(async (t: any) => {
                        const items = await Promise.all(
                            t.items.map(async (i: any) => ({
                                ...i,
                                item_name: await translate(i.item_name, "en"),
                            }))
                        );

                        return {
                            ...t,
                            status: t.status,
                            status_label: capitalizeFirst(t.status),
                            items,
                        };
                    })
                );

                setTransaction(translated);
            } else {
                const localized = transactions.map((t: any) => ({
                    ...t,
                    status: t.status,
                    status_label: statusMap[t.status],
                    items: t.items.map((i: any) => ({
                        ...i,
                        item_name: categoryMap[i.item_name.toLowerCase()] || i.item_name,
                    })),
                }));

                setTransaction(localized);
            }
        };
        doTranslate();
    }, [locale, transactions]);

    const handleSetLang = (lang: string) => {
        if (lang === "id" || lang === "en") {
            setLang(lang);
        }
    };

    const handlePayNow = (transactionId: string) => {
        router.post(
            route("checkout.pay", { id: transactionId }),
            {},
        );
    };

    const handleCancel = (transactionId: string) => {
        router.post(
            route("checkout.cancel", { id: transactionId }),
            {},
        );
    };

    return (
        <div className="px-4 lg:px-20 mb-8">
            {/* Head */}
            <Head title={"Transaksi"} />

            {/* Navbar */}
            <AppNavbar lang={lang} setLang={handleSetLang} forceSolid={true} />

            <div className="pt-20 lg:pt-24">
                {/* Header */}
                <HeaderSection
                    title={t("transaction.title")}
                    showButton={false}
                />

                {/* Content */}
                {transaction.length === 0 ? (
                    <EmptyTransaction />
                ) : (
                    <div className="space-y-6 mt-4">
                        {transaction.map((transaction) => (
                            <div key={transaction.id} className="border rounded-2xl p-6 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {transaction.id}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {new Date(transaction.created_at).toLocaleDateString(
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
                                    <span>
                                        <Badge
                                            className="px-4 py-2"
                                            color={
                                                transaction.status === "pending"
                                                    ? "warning"
                                                    : transaction.status === "paid"
                                                        ? "success"
                                                        : "error"
                                            }
                                        >
                                            {transaction.status_label}
                                        </Badge>
                                    </span>
                                </div>

                                <h3 className="text-md font-semibold mb-2">{t("transaction.detail")}</h3>
                                <ul className="space-y-3">
                                    {transaction.items.map((item: any, index: number) => (
                                        <li
                                            key={`${item.id}-${index}`}
                                            className="flex justify-between items-start border-b pb-2"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{capitalizeFirst(item.item_name)}</p>
                                                {item.variant_details && (
                                                    <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                                        {item.variant_details.color && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <div
                                                                    className="w-4 h-4 rounded-full border border-gray-400"
                                                                    style={{ backgroundColor: item.variant_details.color }}
                                                                />
                                                            </span>
                                                        )}
                                                        {item.variant_details.size && (
                                                            <span>Size {item.variant_details.size}</span>
                                                        )}
                                                        {item.variant_details.note && (
                                                            <p>Note: {item.variant_details.note}</p>
                                                        )}
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

                                <div className="flex items-center justify-end gap-2 mb-4 mt-4">
                                    <h3 className="font-bold text-xl">Subtotal:</h3>
                                    <h1 className="font-bold text-xl">
                                        {formatCurrency(transaction.total_price)}
                                    </h1>
                                </div>

                                {transaction.status === "pending" && (
                                    <div className="flex flex-col-reverse md:flex-row gap-4 mt-4">
                                        <Button
                                            variant="outline"
                                            className="md:w-1/2 border-primary text-primary hover:bg-gray-100"
                                            onClick={() => handleCancel(transaction.id)}
                                        >
                                            {t("transaction.button.cancel")}
                                        </Button>
                                        <Button
                                            className="md:w-1/2"
                                            onClick={() => handlePayNow(transaction.id)}
                                        >
                                            {t("transaction.button.payment")}
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
