import { useState } from "react";
import { usePage } from "@inertiajs/react";
import HeaderSection from "@/Components/card/HeaderSectionCard";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { EmptyTable } from "@/Components/empty/EmptyTable";
import Badge from "@/Components/ui/badge/Badge";
import Pagination from "@/Components/ui/pagination/Pagination";
import { ModalTransaction } from "../modal/ModalTransaction";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formateDate";
import capitalizeFirst from "@/utils/capitalize";

interface Transaction {
    id: string;
    buyer_name: string;
    items: Array<{
        item_type: "ticket" | "merchandise";
        item_name: string;
        quantity: number;
        price: number;
        color?: string;
        size?: string;
        note?: string;
    }>;
    total_price: number;
    channel: string;
    payment_method: "cash" | "qris";
    payment_status: string;
    created_at: string;
    responsible: {
        name: string;
    };
}

interface Props {
    transactions: {
        data: Transaction[];
        links: {};
        last_page: number;
    };
}

export default function TransactionTable() {
    const { props } = usePage();
    const { data: transactions, links, last_page } = props.transactions as {
        data: Transaction[];
        links: {};
        last_page: number;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const colorMap: Record<string, string> = {
        "#ffffff": "Putih",
        "#000000": "Hitam",
        "#ff0000": "Merah",
        "#0914B7FF": "Navy",
    };

    const getItemSummary = (items: Transaction["items"]) => {
        return items
            .map((item) => {
                let name = item.item_name;

                const details: string[] = [];
                if (item.size) details.push(`Ukuran ${item.size}`);
                if (item.color) {
                    const colorName = colorMap[item.color] || item.color;
                    details.push(`Warna ${colorName}`);
                }
                if (details.length > 0) {
                    name += ` (${details.join(", ")})`;
                }

                return `${name} x${item.quantity}`;
            })
            .join(", ");
    };

    const getTotalItems = (items: Transaction["items"]) => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const paymentMethodMap: Record<string, string> = {
        cash: "Tunai",
        qris: "QRIS",
    };

    const paymentStatusMap: Record<string, { label: string; color: "success" | "warning" | "error" }> = {
        paid: { label: "Dibayar", color: "success" },
        pending: { label: "Menunggu", color: "warning" },
        canceled: { label: "Dibatalkan", color: "error" },
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="Transaksi"
                buttonLabel="Tambah"
                onButtonClick={() => setIsModalOpen(true)}
            />

            {/* Modal */}
            <ModalTransaction isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Nama Pembeli
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Item Order
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Total Item
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Total Harga
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Channel
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Metode Pembayaran
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Status Pembayaran
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Tanggal Transaksi
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Penanggung Jawab
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {transactions.length === 0 ? (
                                <EmptyTable colspan={9} description="Tidak ada data transaksi" />
                            ) : (
                                transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            {transaction.buyer_name}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            {getItemSummary(transaction.items)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            {getTotalItems(transaction.items)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {formatCurrency(transaction.total_price)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {capitalizeFirst(transaction.channel)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {paymentMethodMap[transaction.payment_method] || transaction.payment_method}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            <Badge color={"success"}>
                                                {paymentStatusMap[transaction.payment_status]?.label || transaction.payment_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            {formatDateTime(transaction.created_at)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {transaction.responsible?.name || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {last_page > 1 && (
                        <div className="p-4">
                            {Array.isArray(links) ? (
                                <Pagination links={links} />
                            ) : (
                                <div>Error: links is not an array</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
