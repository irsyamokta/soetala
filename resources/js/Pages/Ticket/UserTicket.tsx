import { useState, useEffect } from "react";
import { Head, usePage, usePoll } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import AppNavbar from "@/Components/app/AppNavbar";
import HeaderSection from "@/Components/card/HeaderCard";
import Badge from "@/Components/ui/badge/Badge";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";
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
    status_label: string;
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

    const categoryMapId: Record<string, string> = {
        adult: "Dewasa",
        child: "Anak",
    };

    const categoryMapEn: Record<string, string> = {
        adult: "Adult",
        child: "Child",
    };

    const normalizeKey = (name?: string | null) => {
        if (!name) return "";
        const lower = name.toLowerCase();
        if (["mature", "dewasa", "adult"].includes(lower)) return "adult";
        if (["child", "anak"].includes(lower)) return "child";
        return lower;
    };

    useEffect(() => {
        const filteredTransactions = transactions.filter(
            (t) => t.ticket_orders.length > 0 && t.status === "paid"
        );

        const localizedTransactions = filteredTransactions.map((t) => ({
            ...t,
            ticket_orders: t.ticket_orders.map((order) => {
                const categoryName =
                    locale === "en"
                        ? categoryMapEn[normalizeKey(order.category_name)] || order.category_name || "-"
                        : categoryMapId[normalizeKey(order.category_name)] || order.category_name || "-";

                const statusLabel =
                    order.used_at !== null
                        ? locale === "en"
                            ? `Used (${formatDateTime(order.used_at)})`
                            : `Sudah digunakan (${formatDateTime(order.used_at)})`
                        : locale === "en"
                            ? "Not used"
                            : "Belum digunakan";

                return {
                    ...order,
                    category_name: categoryName,
                    status_label: statusLabel,
                };
            }),
        }));

        setTicketTransactions(localizedTransactions);
    }, [locale, transactions]);

    usePoll(10000, {
        only: ["transactions"],
    });

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
        <div className="px-4 lg:px-20 mb-8 overflow-x-hidden">
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
                                </div>

                                <h3 className="text-md font-semibold mb-2">{t("ticket.history.detail")}</h3>
                                <ul className="space-y-3">
                                    {transaction.ticket_orders.map((ticket) => (
                                        <li
                                            key={ticket.id}
                                            className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start border-b pb-4"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                                                {ticket.qr_code && (
                                                    <div className="mt-2 sm:mt-0 flex-shrink-0">
                                                        <QRCodeCanvas
                                                            id={`qr-${ticket.id}`}
                                                            value={ticket.qr_code}
                                                            size={100}
                                                            level="H"
                                                        />
                                                    </div>
                                                )}
                                                <div className="w-full sm:w-72">
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
                                                    <div className="mt-2">
                                                        <Badge
                                                            key={ticket.id}
                                                            className="px-4 py-1 text-xs"
                                                            color={ticket.used_at ? "error" : "success"}
                                                        >
                                                            {ticket.status_label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex w-full flex-col items-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full sm:w-auto border-primary text-primary hover:bg-gray-100"
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
                className="sm:max-w-[400px] m-4"
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
