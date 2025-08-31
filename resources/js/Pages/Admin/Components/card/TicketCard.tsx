import { useState, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

import { ModalTicket } from "@/Pages/Admin/Components/modal/ModalTicket";
import Button from "@/Components/ui/button/Button";
import HeaderSection from "@/Components/card/HeaderSectionCard";
import EmptyState from "@/Components/empty/EmptyState";
import ImageFallback from "@/Components/ui/images/ImageFallback";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate, formatTime } from "@/utils/formateDate";
import { confirmDialog } from "@/utils/confirmationDialog";
import { createMarkup } from "@/utils/htmlMarkup";

import {
    LuCalendar,
    LuClock,
    LuMapPin,
    LuPencil,
    LuTickets,
    LuTrash2,
} from "react-icons/lu";

export default function TicketCard() {
    const { props }: any = usePage();
    const tickets = props.tickets || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTicket, setEditTicket] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = useCallback(() => {
        setEditTicket(null);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus Tiket?",
            text: "Tiket yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("ticket.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Tiket berhasil dihapus");
                setDeletingId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus tiket");
                setDeletingId(null);
            },
        });
    }, []);

    const handleEdit = useCallback((ticket: any) => {
        setEditTicket(ticket);
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        setEditTicket(null);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="Tiket"
                buttonLabel="Buat"
                onButtonClick={handleCreate}
            />

            {/* Modal */}
            <ModalTicket isOpen={isModalOpen} onClose={handleClose} ticket={editTicket} />

            {/* Cards */}
            {tickets.length === 0 && <EmptyState title="Belum ada tiket" />}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {tickets.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden"
                    >
                        {/* Thumbnail */}
                        <div className="w-full h-48 overflow-hidden">
                            <ImageFallback
                                src={item.thumbnail}
                                alt={item.category}
                                className="w-full h-full object-cover"
                                fallbackClassName="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-6 flex flex-col flex-1 justify-between">
                            {/* Content */}
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 line-clamp-1">
                                    {item.category === "adult" ? "Dewasa" : "Anak"}
                                </h1>
                                <div
                                    className="text-sm text-gray-500 mt-2 line-clamp-3"
                                    dangerouslySetInnerHTML={createMarkup(item.description || "")}
                                />
                                {/* Info Detail */}
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <LuCalendar className="w-4 h-4 shrink-0" />
                                        <span>
                                            {formatDate(item.start_date)} - {formatDate(item.end_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <LuClock className="w-4 h-4 shrink-0" />
                                        <span className="truncate">
                                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <LuMapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2 font-bold text-gray-700">
                                            <LuTickets className="w-4 h-4 shrink-0" />
                                            <span>
                                                Online:{" "}
                                                {item.online_price === 0
                                                    ? "Gratis"
                                                    : formatCurrency(item.online_price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-gray-700">
                                            <span>
                                                Offline:{" "}
                                                {item.offline_price === 0
                                                    ? "Gratis"
                                                    : formatCurrency(item.offline_price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
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
                                    aria-label="Hapus tiket"
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
