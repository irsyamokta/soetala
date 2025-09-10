import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import Chart from "react-apexcharts";

import StatCard from "@/Components/card/StatCard";
import VisitorTable from "@/Components/table/VisitorTable";
import ModalScanTicket from "@/Components/modal/ModalScanTicket";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";

import { PiMoneyWavyBold, PiUsersThreeBold } from "react-icons/pi";
import { HiOutlineTicket } from "react-icons/hi";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RiQrScan2Line } from "react-icons/ri";
import { LuClock3, LuSticker } from "react-icons/lu";
import { IoShirtOutline } from "react-icons/io5";

import { FlashData, Visitor, PageProps } from "@/types/types";

export default function DashboardCard() {
    const { props } = usePage<PageProps>();
    const {
        stocks = [],
        totalRevenue = 0,
        ticketsSold = 0,
        merchandiseSold = 0,
        visitors = [],
        auth,
        today = new Date().toISOString().split("T")[0],
        flash,
        visitorsChart = {},
    } = props;
    const userRole = auth?.user?.role;

    const [openScan, setOpenScan] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [flashState, setFlashState] = useState<FlashData | null>(flash || null);
    const [visitorList, setVisitorList] = useState<Visitor[]>(visitors);
    const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>(visitors);

    useEffect(() => {
        setVisitorList(visitors);
        setFlashState(flash || null);
    }, [visitors, flash]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["stocks", "totalRevenue", "ticketsSold", "merchandiseSold", "visitors", "today", "flash"],
                preserveState: true,
                preserveScroll: true,
            } as any);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const chartCategories = Object.keys(visitorsChart as object);
    const chartSeries = [
        {
            name: "Jumlah Pengunjung",
            data: Object.values(visitorsChart as object),
        },
    ];

    const handleScanResult = (value: string) => {
        router.post(route("dashboard.checkin"), { qr_code: value }, {
            preserveState: true,
            onSuccess: (page) => {
                const response = page.props.flash as FlashData;
                setFlashState(response);
                if (response?.success && response?.data) {
                    const { buyer_name, category_name, quantity, used_at } = response.data;
                    const checkinDate = new Date(used_at);
                    Swal.fire({
                        title: "Checkin Berhasil 🎉",
                        html: `
                            <p>Pengunjung: ${buyer_name}</p>
                            <p>Kategori: ${category_name}</p>
                            <p>Jumlah: ${quantity}</p>
                            <p>Tanggal Checkin: ${checkinDate.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}</p>
                        `,
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#014C8F",
                    }).then(() => {
                        router.reload({ only: ["stocks", "totalRevenue", "ticketsSold", "merchandiseSold", "visitors", "flash"] });
                    });
                } else if (response?.message) {
                    Swal.fire({
                        title: "Gagal Checkin",
                        text: response.message,
                        icon: "error",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#014C8F",
                    });
                } else {
                    Swal.fire({
                        title: "Error",
                        text: "Tidak ada respons valid dari server.",
                        icon: "error",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#014C8F",
                    });
                }
            },
            onError: (errors) => {
                Swal.fire({
                    title: "Gagal Checkin",
                    text: errors.qr_code || "Tiket tidak valid atau sudah digunakan.",
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#014C8F",
                });
            },
        });
    };

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

    const dynamicTotalVisitors = filteredVisitors.reduce((sum, visitor) => sum + visitor.quantity, 0);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* First Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {!isVolunteer && (
                    <>
                        <StatCard
                            icon={<PiMoneyWavyBold className="text-white size-8" />}
                            title="Total Pendapatan"
                            value={formatCurrency(totalRevenue)}
                        />
                        <StatCard
                            icon={<HiOutlineTicket className="text-white size-8" />}
                            title="Total Penjualan Tiket"
                            value={ticketsSold}
                        />
                        <StatCard
                            icon={<MdOutlineProductionQuantityLimits className="text-white size-8" />}
                            title="Merchandise Terjual"
                            value={merchandiseSold}
                        />
                    </>
                )}
                <StatCard
                    icon={<LuClock3 className="text-white size-8" />}
                    title="Waktu Sekarang"
                    value={formattedTime}
                >
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                </StatCard>
                <StatCard
                    icon={<IoShirtOutline className="text-white size-8" />}
                    title="Stok Kaos"
                    value={shirtStock}
                />
                <StatCard
                    icon={<LuSticker className="text-white size-8" />}
                    title="Stok Stiker"
                    value={stickerStock}
                />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
                <div className="col-span-4 lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                    <StatCard
                        icon={<PiUsersThreeBold className="text-white size-8" />}
                        title="Total Pengunjung"
                        value={dynamicTotalVisitors}
                    />
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
                <div className="col-span-4 lg:col-span-3 grid grid-cols-1 gap-4 md:gap-6">
                    <VisitorTable
                        visitors={visitorList}
                        today={today}
                        onFilterChange={setFilteredVisitors}
                    />
                </div>
                <div className="col-span-4 gap-4 md:gap-6">
                    {/* Chart Section */}
                    {!isVolunteer && (
                        <div className="bg-white rounded-2xl shadow p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                                <h2 className="text-lg font-semibold">Grafik Kunjungan</h2>
                            </div>
                            <Chart
                                options={
                                    {
                                        chart: {
                                            type: "line",
                                            toolbar: { show: false },
                                        },
                                        xaxis: {
                                            categories: chartCategories,
                                        },
                                        yaxis: {
                                            labels: {
                                                formatter: function (value) {
                                                    return `${Math.floor(value)}`;
                                                },
                                            },
                                        },
                                        stroke: {
                                            curve: "smooth",
                                        },
                                        dataLabels: {
                                            enabled: true,
                                        },
                                    }
                                }
                                series={chartSeries}
                                type="line"
                                height={300}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
