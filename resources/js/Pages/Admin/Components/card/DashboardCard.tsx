import { useState } from "react";
import { usePage } from "@inertiajs/react";

import StatCard from "@/Components/card/StatCard";
import VisitorTable from "../table/VisitorTable";
import ModalScanTicket from "../modal/ModalScanTicket";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";

import { PiMoneyWavyBold, PiUsersThreeBold } from "react-icons/pi";
import { HiOutlineTicket } from "react-icons/hi";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RiQrScan2Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";

export default function DashboardCard() {
    const { props }: any = usePage();
    const stocks = props.stocks || [];

    const [openScan, setOpenScan] = useState(false);

    const handleScanResult = (value: string) => {

    };

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
                {/* Revenue */}
                <StatCard
                    icon={<PiMoneyWavyBold className="text-white size-8" />}
                    title="Total Pendapatan"
                    value={formatCurrency(0)}
                />
                {/* Ticket */}
                <StatCard
                    icon={<HiOutlineTicket className="text-white size-8" />}
                    title="Total Penjualan Tiket"
                    value="0"
                />
                {/* Merchandise */}
                <StatCard
                    icon={<MdOutlineProductionQuantityLimits className="text-white size-8" />}
                    title="Merchandise Terjual"
                    value="0"
                />
                {/* Merchandise Stock */}
                <StatCard
                    icon={<TbReportAnalytics className="text-white size-8" />}
                    title="Stok Merchandise"
                    value={stocks.reduce((acc: number, item: any) => acc + (item.stock ?? 0), 0)}
                />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
                <div className="sm:col-span-1 grid grid-cols-1 gap-4 md:gap-6">
                    {/* Visitor */}
                    <StatCard
                        icon={<PiUsersThreeBold className="text-white size-8" />}
                        title="Total Pengunjung"
                        value="0"
                    />
                    {/* Scan Ticket */}
                    <StatCard
                        icon={<RiQrScan2Line className="text-white size-8" />}
                        title="Scan Tiket"
                    >
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setOpenScan(true)}
                        >
                            Scan Tiket
                        </Button>

                        <ModalScanTicket
                            open={openScan}
                            onClose={() => setOpenScan(false)}
                            onResult={handleScanResult}
                        />
                    </StatCard>
                </div>
                <div className="sm:col-span-3 grid grid-cols-1 gap-4 md:gap-6">
                    <VisitorTable />
                </div>
            </div>
        </div>
    );
}
