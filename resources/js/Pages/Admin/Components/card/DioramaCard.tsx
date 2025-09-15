import { useState, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";

import { ModalDiorama } from "@/Pages/Admin/Components/modal/ModalDiorama";
import Button from "@/Components/ui/button/Button";
import HeaderSection from "@/Components/card/HeaderSectionCard";
import EmptyState from "@/Components/empty/EmptyState";
import ImageFallback from "@/Components/ui/images/ImageFallback";
import { confirmDialog } from "@/utils/confirmationDialog";

import {
    LuPencil,
    LuTrash2,
} from "react-icons/lu";
import capitalizeFirst from "@/utils/capitalize";

export default function DioramaCard() {
    const { props }: any = usePage();
    const dioramas = props.dioramas|| [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editDiorama, setEditDiorama] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = useCallback(() => {
        setEditDiorama(null);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus Diorama?",
            text: "Diorama yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("diorama.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Diorama berhasil dihapus");
                setDeletingId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus diorama");
                setDeletingId(null);
            },
        });
    }, []);

    const handleEdit = useCallback((diorama: any) => {
        setEditDiorama(diorama);
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        setEditDiorama(null);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="Galeri"
                buttonLabel="Tambah"
                onButtonClick={handleCreate}
            />

            {/* Modal */}
            <ModalDiorama isOpen={isModalOpen} onClose={handleClose} diorama={editDiorama} />

            {/* Cards */}
            {dioramas.length === 0 && <EmptyState title="Belum ada galeri" />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dioramas.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex flex-row rounded-2xl border border-gray-200 bg-white overflow-hidden"
                    >
                        {/* Thumbnail */}
                        <div className="w-1/2 h-auto overflow-hidden">
                            <ImageFallback
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                fallbackClassName="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col justify-between w-full">
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 line-clamp-1">
                                    {capitalizeFirst(item.title)}
                                </h1>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                                    {item.description}
                                </p>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                    Pelukis: <span className="font-bold">{item.author}</span>
                                </p>
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
                                    aria-label="Hapus diorama"
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
                ))}
            </div>
        </div>
    );
}
