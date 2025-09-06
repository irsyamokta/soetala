import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

import StatCard from "@/Components/card/StatCard";
import VisitorTable from "@/Components/table/VisitorTable";
import ModalScanTicket from "@/Components/modal/ModalScanTicket";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";

import { PiMoneyWavyBold, PiUsersThreeBold } from "react-icons/pi";
import { HiOutlineTicket } from "react-icons/hi";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RiQrScan2Line } from "react-icons/ri";
import { LuClock3 } from "react-icons/lu";
import { IoShirtOutline } from "react-icons/io5";
import { LuSticker } from "react-icons/lu";

export default function DashboardCard() {
    const { props }: any = usePage();
    const stocks = props.stocks || [];
    const userRole = props.auth?.user?.role;

    const [openScan, setOpenScan] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const handleScanResult = (value: string) => { };

    const isVolunteer = userRole === "volunteer";

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedDate = currentTime.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = currentTime.toLocaleTimeString("id-ID");

    const shirtStock = stocks
        .filter((item: any) => item.category === "Shirt")
        .reduce((acc: number, item: any) => acc + (item.total_stock ?? 0), 0);

    const stickerStock = stocks
        .filter((item: any) => item.category === "Sticker")
        .reduce((acc: number, item: any) => acc + (item.total_stock ?? 0), 0);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* First Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {!isVolunteer && (
                    <>
                        {/* Revenue */}
                        <StatCard
                            icon={<PiMoneyWavyBold className="text-white size-8" />}
                            title="Total Pendapatan"
                            value={formatCurrency(10000000)}
                        />
                        {/* Ticket */}
                        <StatCard
                            icon={<HiOutlineTicket className="text-white size-8" />}
                            title="Total Penjualan Tiket"
                            value="0"
                        />
                        {/* Merchandise Sold */}
                        <StatCard
                            icon={<MdOutlineProductionQuantityLimits className="text-white size-8" />}
                            title="Merchandise Terjual"
                            value="0"
                        />
                    </>
                )}

                {/* Date & Time */}
                <StatCard
                    icon={<LuClock3 className="text-white size-8" />}
                    title="Waktu Sekarang"
                    value={`${formattedTime}`}
                >
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                </StatCard>

                {/* Shirt Stock */}
                <StatCard
                    icon={<IoShirtOutline className="text-white size-8" />}
                    title="Stok Kaos"
                    value={shirtStock}
                />

                {/* Sticker Stock */}
                <StatCard
                    icon={<LuSticker className="text-white size-8" />}
                    title="Stok Stiker"
                    value={stickerStock}
                />

            </div>

            {/* Second Row */}
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
                    {/* Visitor Table */}
                    <VisitorTable />
                </div>
            </div>
        </div>
    );
}
