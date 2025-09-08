import { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import useApiTranslate from "@/hooks/useApiTranslate";
import AppNavbar from "@/Components/app/AppNavbar";
import HeaderSection from "@/Components/card/HeaderCard";
import Badge from "@/Components/ui/badge/Badge";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import capitalizeFirst from "@/utils/capitalize";
import { QRCodeCanvas } from "qrcode.react";
import { EmptyTicket } from "./card/EmptyTicket";
import { Modal } from "@/Components/ui/modal";
import { formatDateTime } from "@/utils/formateDate";

type TicketOrder = {
    id: string;
    ticket_id: string;
    ticket_category_id: string;
    buyer_name: string;
    phone: string | null;
    quantity: number;
    category_name: string;
    price: number;
    qr_code: string | null;
    used_at: string | null;
};

type Transaction = {
    id: string;
    type: string;
    total_price: number;
    status: "pending" | "paid" | "canceled";
    status_label: string;
    created_at: string;
    ticket_orders: TicketOrder[];
};

type Props = {
    transactions: Transaction[];
};

export default function TicketHistory({ transactions }: Props) {
    const [lang, setLang] = useState<"id" | "en">("id");
    const [ticketTransactions, setTicketTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(null);

    const { locale } = usePage().props;
    const t = useTranslate();
    const { translate } = useApiTranslate();

    console.log(transactions);

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
            const filteredTransactions = transactions.filter(
                (t) => t.ticket_orders.length > 0 && t.status === "paid"
            );

            if (locale === "en") {
                const translated = await Promise.all(
                    filteredTransactions.map(async (t: Transaction) => {
                        const ticketOrders = await Promise.all(
                            t.ticket_orders.map(async (order: TicketOrder) => ({
                                ...order,
                                category_name: await translate(order.category_name, "en"),
                            }))
                        );

                        return {
                            ...t,
                            status_label: capitalizeFirst(t.status),
                            ticket_orders: ticketOrders,
                        };
                    })
                );
                setTicketTransactions(translated);
            } else {
                const localized = filteredTransactions.map((t: Transaction) => ({
                    ...t,
                    status_label: statusMap[t.status],
                    ticket_orders: t.ticket_orders.map((order: TicketOrder) => ({
                        ...order,
                        category_name: categoryMap[order.category_name.toLowerCase()] || order.category_name,
                    })),
                }));
                setTicketTransactions(localized);
            }
        };
        doTranslate();
    }, [locale, transactions]);

    const handleSetLang = (lang: string) => {
        if (lang === "id" || lang === "en") {
            setLang(lang);
        }
    };

    const showQrCodeModal = (ticket: TicketOrder) => {
        if (ticket.qr_code) {
            setSelectedTicket(ticket);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

    return (
        <div className="px-4 lg:px-20 mb-8">
            <Head title={t("ticket.history.title")} />
            <AppNavbar lang={lang} setLang={handleSetLang} forceSolid={true} />

            <div className="pt-20 lg:pt-24">
                <HeaderSection
                    title={t("ticket.history.title")}
                    showButton={false}
                />

                {ticketTransactions.length === 0 ? (
                    <EmptyTicket />
                ) : (
                    <div className="space-y-6 mt-4">
                        {ticketTransactions.map((transaction) => (
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
                                    <Badge
                                        className="px-4 py-2"
                                        color="success"
                                    >
                                        {transaction.status_label}
                                    </Badge>
                                </div>

                                <h3 className="text-md font-semibold mb-2">{t("ticket.history.detail")}</h3>
                                <ul className="space-y-3">
                                    {transaction.ticket_orders.map((ticket) => (
                                        <li
                                            key={ticket.id}
                                            className="flex flex-col gap-4 sm:flex-row justify-between items-start border-b pb-4"
                                        >
                                            <div className="flex-1 flex items-center gap-8">
                                                <div>
                                                    {ticket.qr_code && (
                                                        <div className="mt-2">
                                                            <QRCodeCanvas
                                                                id={`qr-${ticket.id}`}
                                                                value={ticket.qr_code}
                                                                size={100}
                                                                level="H"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{ticket.category_name}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {t("ticket.history.buyer")}: {ticket.buyer_name}
                                                    </p>
                                                    {ticket.phone && (
                                                        <p className="text-sm text-gray-500">
                                                            {t("ticket.history.phone")}: {ticket.phone}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatCurrency(ticket.price)} × {ticket.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex w-full flex-col items-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="border-primary text-primary hover:bg-gray-100"
                                                    onClick={() => showQrCodeModal(ticket)}
                                                >
                                                    {t("ticket.history.show.qr")}
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                className="max-w-[400px] m-4"
            >
                {selectedTicket && (
                    <div className="p-4">
                        <div className="flex justify-center mb-4 mt-10">
                            {selectedTicket.qr_code && (
                                <QRCodeCanvas
                                    value={selectedTicket.qr_code}
                                    size={200}
                                    level="H"
                                />
                            )}
                        </div>
                        <div className="flex justify-center items-center px-10">
                            <table className="w-full text-sm text-left text-gray-700">
                                <tbody>
                                    <tr className="border-b">
                                        <th className="py-2 font-medium">{t("ticket.history.buyer")}</th>
                                        <td className="py-2">{selectedTicket.buyer_name}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <th className="py-2 font-medium">{t("ticket.history.category")}</th>
                                        <td className="py-2">{selectedTicket.category_name}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <th className="py-2 font-medium">{t("ticket.history.price")}</th>
                                        <td className="py-2">{formatCurrency(selectedTicket.price)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <th className="py-2 font-medium">{t("ticket.history.quantity")}</th>
                                        <td className="py-2">{selectedTicket.quantity}</td>
                                    </tr>
                                    {selectedTicket.phone && (
                                        <tr className="border-b">
                                            <th className="py-2 font-medium">{t("ticket.history.phone")}</th>
                                            <td className="py-2">{selectedTicket.phone}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <th className="py-2 font-medium">Status</th>
                                        <td className="py-2">
                                            {selectedTicket.used_at ? (
                                                <span className="text-red-500">
                                                    {t("ticket.history.used")} (
                                                    {formatDateTime(selectedTicket.used_at)})
                                                </span>
                                            ) : (
                                                <span className="text-green-500">{t("ticket.history.not_used")}</span>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
