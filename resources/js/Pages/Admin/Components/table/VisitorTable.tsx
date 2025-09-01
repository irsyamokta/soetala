import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

import { EmptyTable } from "@/Components/empty/EmptyTable";
import Badge from "@/Components/ui/badge/Badge";
// import { formatCalendarDate } from "@/utils/formateDate";

export default function VisitorTable() {

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Nama Pengunjung
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Kategori Tiket
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status Checkin
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tanggal Kunjungan
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        <EmptyTable colspan={4} description="Tidak ada data" />
                        {/* <TableRow>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                John Doe
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                Dewasa
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                <Badge color="success">Checkin</Badge>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                Senin, 1 September 2025
                            </TableCell>
                        </TableRow> */}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
