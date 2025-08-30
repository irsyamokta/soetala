import { LuLayoutDashboard, LuTicket, LuUserRound } from "react-icons/lu";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";

export const navConfig: Record<string, any[]> = {
    admin: [
        { icon: <LuLayoutDashboard />, name: "Dashboard", path: "/dashboard" },
        { icon: <LuTicket />, name: "Tiket", path: "/ticket" },
        { icon: <MdOutlineProductionQuantityLimits />, name: "Merchandise", path: "/merchandise" },
        { icon: <GrTransaction />, name: "Transaksi", path: "/transaction" },
        { icon: <LuUserRound />, name: "User", path: "/user" },
    ],
};
