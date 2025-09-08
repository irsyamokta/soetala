import { useState, useMemo, useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { parseISO, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import Input from "@/Components/form/input/InputField";
import Button from "@/Components/ui/button/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { EmptyTable } from "@/Components/empty/EmptyTable";
import Badge from "@/Components/ui/badge/Badge";
import { formatDateTime } from "@/utils/formateDate";

import { FiDownload } from "react-icons/fi";
import { Visitor } from "@/types/types";

type VisitorTableProps = {
    visitors: Visitor[];
    today: string;
    onFilterChange?: (filtered: Visitor[]) => void;
};

export default function VisitorTable({ visitors = [], today, onFilterChange }: VisitorTableProps) {
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<string | null>(today);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const { flash, auth } = usePage().props;
    const isVolunteer = (auth as { user?: { role?: string } })?.user?.role === "volunteer";

    useEffect(() => {
        setSelectedDate(today);

        if (!dateInputRef.current || isVolunteer) return;

        const picker = flatpickr(dateInputRef.current, {
            dateFormat: "Y-m-d",
            defaultDate: today,
            onChange: (dates: Date[]) => {
                if (dates.length > 0) {
                    const zonedDate = toZonedTime(dates[0], "Asia/Jakarta");
                    setSelectedDate(format(zonedDate, "yyyy-MM-dd"));
                } else {
                    setSelectedDate(null);
                }
            },
        });

        return () => {
            picker.destroy();
        };
    }, [today, isVolunteer]);

    useEffect(() => {
        const flashMessage = (flash as { message?: string })?.message;
        if (flashMessage) {
            Swal.fire({
                title: "Pemberitahuan",
                text: flashMessage,
                icon: "info",
                confirmButtonText: "OK",
                confirmButtonColor: "#014c8f",
            });
        }
    }, [flash]);

    const filteredVisitors = useMemo(() => {
        let result = visitors;

        if (search) {
            result = result.filter((v) =>
                v.buyer_name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (isVolunteer) {
            const todayZoned = toZonedTime(parseISO(today), "Asia/Jakarta");
            const todayStr = format(todayZoned, "yyyy-MM-dd");
            result = result.filter((v) => {
                if (!v.used_at) return false;
                const zonedDate = toZonedTime(parseISO(v.used_at), "Asia/Jakarta");
                return format(zonedDate, "yyyy-MM-dd") === todayStr;
            });
        } else if (selectedDate) {
            result = result.filter((v) => {
                if (!v.used_at) return false;
                const zonedDate = toZonedTime(parseISO(v.used_at), "Asia/Jakarta");
                return format(zonedDate, "yyyy-MM-dd") === selectedDate;
            });
        }

        if (onFilterChange) {
            onFilterChange(result);
        }

        return result;
    }, [visitors, search, selectedDate, today, isVolunteer, onFilterChange]);

    const handleExport = () => {
        if (!selectedDate) {
            Swal.fire({
                title: "Error",
                text: "Silakan pilih tanggal terlebih dahulu!",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#014c8f",
            });
            return;
        }
        window.location.href = `${route("visitors.export")}?date=${selectedDate}`;
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Header */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-white/[0.05]">
                <h1 className="font-semibold text-gray-800">Daftar Pengunjung</h1>
                <div className="flex items-center gap-3">
                    <Input
                        type="text"
                        placeholder="Cari nama pengunjung.."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {!isVolunteer && (
                        <div className="flex items-center gap-2">
                            <Input
                                ref={dateInputRef}
                                type="text"
                                className="rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Pilih tanggal kunjungan"
                                readOnly
                            />
                            <Button onClick={handleExport} disabled={!selectedDate}>
                                <FiDownload />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Nama Pengunjung
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Kategori Tiket
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Quantity
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Status Checkin
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Tanggal Kunjungan
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {filteredVisitors.length === 0 ? (
                            <EmptyTable colspan={5} description="Tidak ada data" />
                        ) : (
                            filteredVisitors.map((visitor) => (
                                <TableRow key={visitor.id}>
                                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                        {visitor.buyer_name}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                        {visitor.category_name}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm">
                                        {visitor.quantity}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-500 text-theme-sm">
                                        <Badge color={visitor.used_at ? "success" : "warning"}>
                                            {visitor.used_at ? "Checkin" : "Belum Checkin"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-500 text-theme-sm">
                                        {visitor.used_at ? formatDateTime(visitor.used_at) : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
