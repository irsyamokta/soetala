import { useState, useCallback } from "react";
import { router, usePage, usePoll } from "@inertiajs/react";
import { PageProps } from "@/types";
import { confirmDialog } from "@/utils/confirmationDialog";
import { toast } from "react-toastify";

import HeaderSection from "@/Components/card/HeaderSectionCard";
import Input from "@/Components/form/input/InputField";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { EmptyTable } from "@/Components/empty/EmptyTable";
import Button from "@/Components/ui/button/Button";
import Badge from "@/Components/ui/badge/Badge";
import ImageFallback from "@/Components/ui/images/ImageFallback";
import Pagination from "@/Components/ui/pagination/Pagination";
import { ModalUser } from "../modal/ModalUser";

import { formatDateTime } from "@/utils/formateDate";
import { LuTrash2, LuPencil } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import ImageUser from "../../../../../assets/images/image-user.png";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    gender?: string | null;
    avatar?: string | null;
    status_verified: "Verified" | "Unverified";
    created_at: string;
}

interface UserPageProps extends PageProps {
    users: {
        data: User[];
        links: any[];
        last_page: number;
    };
    filters: {
        search: string;
    };
}

export default function UserTable() {
    const { props } = usePage<UserPageProps>();
    const { data: users, links, last_page } = props.users;
    const { search: initialSearch } = props.filters;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(initialSearch);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    usePoll(5000, { only: ["users"] });

    const handleDelete = useCallback(async (id: string) => {
        const ok = await confirmDialog({
            title: "Hapus User?",
            text: "User yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });
        if (!ok) return;

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

    const handleEdit = useCallback((user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingUser(null);
    }, []);

    const handleSearch = () => {
        router.get(
            route("dashboard.user"),
            { search: search.trim() },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchClick = () => {
        router.get(
            route("dashboard.user"),
            { search: search.trim() },
            { preserveState: true, replace: true }
        );
    };

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
            <ModalUser
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={editingUser}
            />

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {/* Search Input */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                    <h1 className="text-lg font-semibold text-gray-800">Daftar Pengguna</h1>
                    <div className="flex items-center gap-2 w-full sm:w-2/4">
                        <div className="w-full">
                            <Input
                                type="text"
                                placeholder="Cari nama, email, atau no. telepon..."
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

                <div className="max-w-full overflow-x-auto no-scrollbar">
                    <Table>
                        <TableHeader className="border-b border-gray-100">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 whitespace-nowrap"
                                >
                                    Foto Profil
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 whitespace-nowrap"
                                >
                                    Nama Lengkap
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 whitespace-nowrap"
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 whitespace-nowrap"
                                >
                                    Nomor HP
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 whitespace-nowrap"
                                >
                                    Jenis Kelamin
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                                >
                                    Status
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 whitespace-nowrap"
                                >
                                    Dibuat
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                                >
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <EmptyTable colspan={8} description="Tidak ada data user" />
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 whitespace-nowrap">
                                            <ImageFallback
                                                src={user.avatar || ImageUser}
                                                alt={user.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 whitespace-nowrap">
                                            {user.name}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 whitespace-nowrap">
                                            {user.email}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 whitespace-nowrap">
                                            {user.phone ?? "-"}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500">
                                            {user.gender ?? "-"}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm">
                                            <Badge
                                                color={user.status_verified === "Verified" ? "success" : "error"}
                                            >
                                                {user.status_verified}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 whitespace-nowrap">
                                            {formatDateTime(user.created_at)}
                                        </TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 flex gap-2">
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
                </div>
                {last_page > 1 && (
                    <div className="p-4 border-t">
                        <Pagination links={links} />
                    </div>
                )}
            </div>
        </div>
    );
}
