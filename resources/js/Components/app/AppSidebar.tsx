import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { HiDotsHorizontal } from "react-icons/hi";
import { useSidebar } from "@/Context/SidebarContext";
import logoColor from "../../../assets/logo/logo-color.png";
import logoWhite from "../../../assets/logo/logo-white.png";

type SubItem = {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
};

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: SubItem[];
};

type AppSidebarProps = {
    navItems: NavItem[];
    othersItems?: NavItem[];
};

const AppSidebar: React.FC<AppSidebarProps> = ({ navItems, othersItems = [] }) => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const { url: currentUrl } = usePage();

    const isActive = useCallback(
        (path?: string) => {
            if (!path) return false;

            const cleanUrl = currentUrl.split("?")[0];
            return cleanUrl === path || cleanUrl.startsWith(path + "/");
        },
        [currentUrl]
    );
    const renderMenuItems = (items: NavItem[]) => (
        <ul className="flex flex-col gap-4">
            {items.map((nav) =>
                nav.path ? (
                    <li key={nav.name}>
                        <Link
                            href={nav.path}
                            className={`menu-item group ${isActive(nav.path)
                                ? "menu-item-active"
                                : "menu-item-inactive"
                                }`}
                        >
                            <span
                                className={`menu-item-icon-size ${isActive(nav.path)
                                    ? "menu-item-icon-active"
                                    : "menu-item-icon-inactive"
                                    }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{nav.name}</span>
                            )}
                        </Link>
                    </li>
                ) : null
            )}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-primary text-white h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo */}
            <div
                className={`py-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
            >
                <Link href="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <img src={logoWhite} alt="Logo" className="dark:hidden w-48" />
                            <img src={logoColor} alt="Logo" className="hidden dark:block w-48" />
                        </>
                    ) : (
                        <img
                            className="w-10"
                            src="/favicon.png"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    )}
                </Link>
            </div>

            {/* Menu */}
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-white ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    ""
                                ) : (
                                    <HiDotsHorizontal className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems)}
                        </div>

                        {othersItems.length > 0 && (
                            <div>
                                <h2
                                    className={`mb-4 text-xs uppercase flex leading-[20px] text-white ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                        }`}
                                >
                                    {isExpanded || isHovered || isMobileOpen ? (
                                        "Lainnya"
                                    ) : (
                                        <HiDotsHorizontal className="size-6" />
                                    )}
                                </h2>
                                {renderMenuItems(othersItems)}
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
