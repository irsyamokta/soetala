import { useState, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";

import { ModalMerchandise } from "@/Pages/Admin/Components/modal/ModalMerchandise";
import Button from "@/Components/ui/button/Button";
import HeaderSection from "@/Components/card/HeaderSectionCard";
import EmptyState from "@/Components/empty/EmptyState";
import ImageFallback from "@/Components/ui/images/ImageFallback";
import { confirmDialog } from "@/utils/confirmationDialog";
import { formatCurrency } from "@/utils/formatCurrency";

import {
    LuPencil,
    LuTrash2,
} from "react-icons/lu";
import capitalizeFirst from "@/utils/capitalize";

export default function MerchandiseCard() {
    const { props }: any = usePage();
    const merchandises = props.merchandises || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMerchandise, setEditMerchandise] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = useCallback(() => {
        setEditMerchandise(null);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus Merchandise?",
            text: "Merchandise yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("merchandise.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Merchandise berhasil dihapus");
                setDeletingId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus merchandise");
                setDeletingId(null);
            },
        });
    }, []);

    const handleEdit = useCallback((merchandise: any) => {
        setEditMerchandise(merchandise);
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        setEditMerchandise(null);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="Merchandise"
                buttonLabel="Tambah"
                showButton={merchandises.length === 0}
                onButtonClick={handleCreate}
            />

            {/* Modal */}
            <ModalMerchandise isOpen={isModalOpen} onClose={handleClose} merchandise={editMerchandise} />

            {/* Cards */}
            {merchandises.length === 0 && <EmptyState title="Belum ada merchandise" />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {merchandises.map((item: any) => {
                    const stockPerMerchandise = item.variants
                        ? item.variants.reduce((total: number, v: any) => total + (v.stock || 0), 0)
                        : 0;

                    return (
                        <div
                            key={item.id}
                            className="flex flex-row rounded-2xl border border-gray-200 bg-white overflow-hidden"
                        >
                            {/* Thumbnail */}
                            <div className="w-1/2 p-4 h-auto rounded-lg overflow-hidden">
                                <ImageFallback
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    fallbackClassName="w-full h-full object-cover rounded-lg"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col justify-between w-full">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800 line-clamp-1">
                                        {capitalizeFirst(item.product_name)}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                                        {item.description}
                                    </p>
                                    <div className="flex gap-5">
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                            <span className="font-bold">{formatCurrency(item.price)}</span>
                                        </p>
                                        <p className="text-sm font-bold text-gray-500 mt-2 line-clamp-1">
                                            Stok: <span>{stockPerMerchandise ? stockPerMerchandise : 0}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        type="button"
                                        size="md"
                                        variant="default"
                                        onClick={() => handleEdit(item)}
                                        aria-label="Edit tiket"
                                        disabled={deletingId === item.id}
                                    >
                                        <LuPencil />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="md"
                                        variant="danger"
                                        onClick={() => handleDelete(item.id)}
                                        aria-label="Hapus merchandise"
                                        disabled={deletingId === item.id}
                                    >
                                        {deletingId === item.id ? (
                                            <LuTrash2 className="animate-spin" />
                                        ) : (
                                            <LuTrash2 />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
