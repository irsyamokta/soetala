import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/Components/ui/table";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import HeaderSection from "@/Components/card/HeaderSectionCard";

interface Report {
    date: string;
    methods: Record<string, number>;
    total: number;
}

interface ReportPageProps extends PageProps {
    report: Report[];
}

export default function ReportTable() {
    const { props } = usePage<ReportPageProps>();
    const { report } = props;

    const paymentMethods = ["QRIS", "Cash"];

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="Laporan Keuangan"
                showButton={false}
            />

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto no-scrollbar">
                    <Table>
                        <TableHeader className="border-b border-gray-100">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 text-start text-sm">Tanggal</TableCell>
                                {paymentMethods.map((method) => (
                                    <TableCell key={method} isHeader className="px-5 py-3 text-start text-sm">
                                        {method}
                                    </TableCell>
                                ))}
                                <TableCell isHeader className="px-5 py-3 text-start text-sm">Total</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100">
                            {report.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={paymentMethods.length + 2} className="px-5 py-3 text-center text-gray-500">
                                        Tidak ada data
                                    </TableCell>
                                </TableRow>
                            ) : (
                                report.map((r) => (
                                    <TableRow key={r.date}>
                                        <TableCell className="px-5 py-3 text-gray-500">{format(new Date(r.date), "dd MMM yyyy")}</TableCell>
                                        {paymentMethods.map((method) => {
                                            const key = Object.keys(r.methods || {}).find(
                                                (k) => k.toLowerCase() === method.toLowerCase()
                                            );
                                            const value = key ? r.methods[key] : 0;
                                            return (
                                                <TableCell key={method} className="px-5 py-3 text-gray-500">
                                                    {formatCurrency(value)}
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell className="px-5 py-3 font-semibold">
                                            {formatCurrency(r.total)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
