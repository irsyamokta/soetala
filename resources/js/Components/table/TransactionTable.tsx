import { useState, useCallback } from "react";
import { usePage, usePoll, router } from "@inertiajs/react";
import { PageProps } from "@/types/types";

import { confirmDialog } from "@/utils/confirmationDialog";
import { toast } from "react-toastify";

import Input from "@/Components/form/input/InputField";
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
import { ModalTransaction } from "../../Pages/Admin/Components/modal/ModalTransaction";
import { ModalPickupStatusUpdate } from "@/Components/modal/ModalPickupStatus";
import Button from "@/Components/ui/button/Button";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formateDate";
import capitalizeFirst from "@/utils/capitalize";

import { LuPencil, LuTrash2 } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";

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
    pickup_status: string;
    created_at: string;
    responsible: {
        name: string;
    };
}

interface Props extends PageProps {
    transactions: {
        data: Transaction[];
        links: any[];
        last_page: number;
    };
    filters: {
        search: string;
    };
}

export default function TransactionTable() {
    const { props } = usePage<Props>();
    const { data: transactions, links, last_page } = props.transactions;
    const { search: initialSearch } = props.filters || { search: "" };

    const isAdmin = props.auth.user.role === "admin";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPickupStatusModalOpen, setIsPickupStatusModalOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState("");
    const [search, setSearch] = useState(initialSearch);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    usePoll(15000, {
        only: ["transactions"],
    });

    const colorMap: Record<string, string> = {
        "#ffffff": "Putih",
        "#000000": "Hitam",
        "#ff0000": "Merah",
        "#0914B7FF": "Navy",
    };

    const categoryMap: Record<string, string> = {
        adult: "Dewasa",
        child: "Anak",
    };

    const getItemSummary = (items: Transaction["items"]) => {
        return items
            .map((item) => {
                let name = item.item_name;

                if (categoryMap[name.toLowerCase()]) {
                    name = categoryMap[name.toLowerCase()];
                }

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

    const getNotes = (items: Transaction["items"]) => {
        const notes = items
            .map((item) => item.note)
            .filter((note) => note)
            .join(", ");
        return notes || "-";
    };

    const paymentMethodMap: Record<string, string> = {
        cash: "Tunai",
        qris: "QRIS",
    };

    const paymentStatusMap: Record<string, { label: string; color: "success" | "warning" | "error" }> = {
        paid: { label: "Dibayar", color: "success" },
        pending: { label: "Menunggu", color: "warning" },
        canceled: { label: "Dibatalkan", color: "error" },
        expired: { label: "Kedaluarsa", color: "error" },
    };

    const pickupStatusMap: Record<string, { label: string; color: "success" | "warning" | "error" }> = {
        picked_up: { label: "Sudah Diambil", color: "success" },
        pending: { label: "Belum Diambil", color: "warning" },
    };

    const handleEditPickupStatus = (transactionId: string) => {
        setSelectedTransactionId(transactionId);
        setIsPickupStatusModalOpen(true);
    };

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus Transaksi?",
            text: "Transaksi yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("transaction.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Transaksi berhasil dihapus");
                setDeletingId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus transaksi");
                setDeletingId(null);
            },
        });
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            router.get(
                route("dashboard.transaction"),
                { search: search.trim() },
                { preserveState: true, replace: true }
            );
        }
    };

    const handleSearchClick = () => {
        router.get(
            route("dashboard.transaction"),
            { search: search.trim() },
            { preserveState: true, replace: true }
        );
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
            <ModalPickupStatusUpdate
                isOpen={isPickupStatusModalOpen}
                onClose={() => setIsPickupStatusModalOpen(false)}
                transactionId={selectedTransactionId}
            />

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {/* Search Input */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                    <h1 className="text-lg font-semibold text-gray-800">Daftar Transaksi</h1>
                    <div className="flex items-center gap-2 w-full sm:w-2/4">
                        <div className="w-full">
                            <Input
                                type="text"
                                placeholder="Cari nama pembeli..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <Button
                            type="button"
                            size="md"
                            variant="default"
                            onClick={handleSearchClick}
                        >
                            <IoSearch />
                        </Button>
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Nama Pembeli
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Item Order
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Total Item
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Total Harga
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Catatan
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Channel
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Metode Pembayaran
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Status Pembayaran
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Status Pengambilan
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Tanggal Transaksi
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Penanggung Jawab
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <EmptyTable colspan={12} description="Tidak ada data transaksi" />
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
                                            {getNotes(transaction.items)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {capitalizeFirst(transaction.channel)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {paymentMethodMap[transaction.payment_method] || transaction.payment_method || "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            <Badge color={paymentStatusMap[transaction.payment_status]?.color || "success"}>
                                                {paymentStatusMap[transaction.payment_status]?.label || transaction.payment_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            <Badge color={pickupStatusMap[transaction.pickup_status]?.color || "warning"}>
                                                {pickupStatusMap[transaction.pickup_status]?.label || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm whitespace-nowrap">
                                            {formatDateTime(transaction.created_at)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            {transaction.responsible?.name || "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm flex gap-2">
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="default"
                                                aria-label="Edit status"
                                                onClick={() => handleEditPickupStatus(transaction.id)}
                                            >
                                                <LuPencil />
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    type="button"
                                                    size="md"
                                                    variant="danger"
                                                    aria-label="Hapus"
                                                    onClick={() => handleDelete(transaction.id)}
                                                    disabled={deletingId === transaction.id}
                                                >
                                                    {deletingId === transaction.id ? (
                                                        <LuTrash2 className="animate-spin" />
                                                    ) : (
                                                        <LuTrash2 />
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {last_page > 1 && (
                        <div className="p-4 border-t">
                            <Pagination links={links} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
