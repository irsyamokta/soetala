import { useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
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
import { Modal } from "@/Components/ui/modal";
import Button from "@/Components/ui/button/Button";
import Select from "@/Components/form/Select";
import Label from "@/Components/form/Label";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formateDate";
import capitalizeFirst from "@/utils/capitalize";
import { toast } from "react-toastify";
import { LuPencil } from "react-icons/lu";

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

interface Props {
    transactions: {
        data: Transaction[];
        links: {};
        last_page: number;
    };
}

const ModalPickupStatusUpdate = ({ isOpen, onClose, transactionId }: { isOpen: boolean; onClose: () => void; transactionId: string }) => {
    const [pickupStatus, setPickupStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(route("transaction.updatePickupStatus", transactionId), { pickup_status: pickupStatus }, {
            onSuccess: () => {
                toast.success("Status pengambilan barang berhasil diperbarui");
                setLoading(false);
                onClose();
            },
            onError: () => {
                toast.error("Gagal memperbarui status pengambilan barang");
                setLoading(false);
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] h-[250px] m-4">
            <div className="p-6">
                <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Status Pengambilan Barang
                </h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label required={true}>Status Pengambilan</Label>
                        <Select
                            value={pickupStatus}
                            onChange={(value) => setPickupStatus(value)}
                            options={[
                                { value: "pending", label: "Belum Diambil" },
                                { value: "picked_up", label: "Sudah Diambil" },
                            ]}
                            placeholder="Pilih status pengambilan"
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                        <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button size="sm" type="submit" variant="default" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default function TransactionTable() {
    const { props } = usePage();
    const { data: transactions, links, last_page } = props.transactions as {
        data: Transaction[];
        links: {};
        last_page: number;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPickupStatusModalOpen, setIsPickupStatusModalOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState("");
    const [search, setSearch] = useState("");

    const colorMap: Record<string, string> = {
        "#ffffff": "Putih",
        "#000000": "Hitam",
        "#ff0000": "Merah",
        "#0914B7FF": "Navy",
    };

    const filteredTransactions = useMemo(() => {
        if (!search) return transactions;
        return transactions.filter((transaction) =>
            transaction.buyer_name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [transactions, search]);

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
    };

    const pickupStatusMap: Record<string, { label: string; color: "success" | "warning" | "error" }> = {
        picked_up: { label: "Sudah Diambil", color: "success" },
        pending: { label: "Belum Diambil", color: "warning" },
    };

    const handleEditPickupStatus = (transactionId: string) => {
        setSelectedTransactionId(transactionId);
        setIsPickupStatusModalOpen(true);
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
                <div className="flex justify-between items-center p-4">
                    <h1 className="text-lg font-semibold text-gray-800">Daftar Transaksi</h1>
                    <Input
                        type="text"
                        placeholder="Cari nama pembeli..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/[0.1] dark:bg-transparent"
                    />
                </div>
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
                                    Catatan
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
                                    Status Pengambilan
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
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap"
                                >
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {filteredTransactions.length === 0 ? (
                                <EmptyTable colspan={12} description="Tidak ada data transaksi" />
                            ) : (
                                filteredTransactions.map((transaction) => (
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
                                            {paymentMethodMap[transaction.payment_method] || transaction.payment_method}
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
                                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="default"
                                                aria-label="Edit status"
                                                onClick={() => handleEditPickupStatus(transaction.id)}
                                            >
                                                <LuPencil />
                                            </Button>
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
