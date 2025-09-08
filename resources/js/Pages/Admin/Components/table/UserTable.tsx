import { useState, useMemo, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { confirmDialog } from "@/utils/confirmationDialog";
import { toast } from "react-toastify";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

import HeaderSection from "@/Components/card/HeaderSectionCard";
import { EmptyTable } from "@/Components/empty/EmptyTable";
import Button from "@/Components/ui/button/Button";
import Badge from "@/Components/ui/badge/Badge";
import ImageFallback from "@/Components/ui/images/ImageFallback";
import { formatDateTime } from "@/utils/formateDate";
import { LuTrash2, LuPencil } from "react-icons/lu";

import ImageUser from "../../../../../assets/images/image-user.png";
import Input from "@/Components/form/input/InputField";
import Pagination from "@/Components/ui/pagination/Pagination";
import { ModalUser } from "../modal/ModalUser";

export default function UserTable() {
    const { props }: any = usePage();
    const users = props.users?.data || [];
    const links = props.users?.links || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        return users.filter((user: any) =>
            [user.name, user.email, user.phone].some((field) =>
                field?.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [users, search]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus User?",
            text: "User yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("user.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("User berhasil dihapus");
                setDeletingId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus user");
                setDeletingId(null);
            },
        });
    }, []);

    const handleEdit = useCallback((user: any) => {
        setEditingUser(user);
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        setEditingUser(null);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="User"
                buttonLabel="Tambah"
                onButtonClick={() => {
                    setEditingUser(null);
                    setIsModalOpen(true);
                }}
            />

            {/* Modal */}
            <ModalUser isOpen={isModalOpen} onClose={handleClose} user={editingUser} />

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                {/* Search Input */}
                <div className="flex justify-between items-center p-4">
                    <h1 className="text-lg font-semibold text-gray-800">Daftar Pengguna</h1>
                    <Input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/[0.1] dark:bg-transparent"
                    />
                </div>
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Foto Profil
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Nama Lengkap
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Email
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Nomor HP
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Jenis Kelamin
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Dibuat
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {filteredUsers.length === 0 ? (
                                <EmptyTable colspan={8} description="Tidak ada data user" />
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            <ImageFallback
                                                src={user.avatar || ImageUser}
                                                alt={user.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.phone ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {user.gender ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm">
                                            {user.status_verified === "Verified" ? (
                                                <Badge color="success">Verified</Badge>
                                            ) : (
                                                <Badge color="error">Unverified</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {formatDateTime(user.created_at)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 flex gap-2">
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="default"
                                                aria-label="Edit user"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <LuPencil />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="danger"
                                                aria-label="Hapus user"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deletingId === user.id}
                                            >
                                                {deletingId === user.id ? (
                                                    <LuTrash2 className="animate-spin" />
                                                ) : (
                                                    <LuTrash2 />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {props.users.last_page > 1 && (
                        <div className="p-4">
                            <Pagination links={links} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
