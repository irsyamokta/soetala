import { useState, useEffect, useRef } from 'react';
import useTranslate from "@/hooks/useTranslate";
import { router, Link, usePage } from '@inertiajs/react';
import Button from '@/Components/ui/button/Button';
import { LuUser } from 'react-icons/lu';
import { IoLocationOutline } from "react-icons/io5";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import LogoWhite from "../../../assets/logo/logo-white.png";
import LogoColor from "../../../assets/logo/logo-color.png";
import SvgId from "../../../assets/svg/svg-id.svg";
import SvgUk from "../../../assets/svg/svg-uk.svg";

interface NavbarProps {
    lang: string;
    setLang: (lang: string) => void;
    forceSolid?: boolean;
}

const Navbar = ({ lang, setLang, forceSolid = false }: NavbarProps) => {
    const { auth, locale }: any = usePage().props;

    const [openLang, setOpenLang] = useState(false);
    const [openUser, setOpenUser] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const langRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    const t = useTranslate();

    useEffect(() => {
        if (!forceSolid) {
            const handleScroll = () => {
                setScrolled(window.scrollY > 50);
            };
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        } else {
            setScrolled(true);
        }
    }, [forceSolid]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                langRef.current &&
                !langRef.current.contains(event.target as Node)
            ) {
                setOpenLang(false);
            }
            if (
                userRef.current &&
                !userRef.current.contains(event.target as Node)
            ) {
                setOpenUser(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isSolid = forceSolid || scrolled;

    const changeLanguage = (lang: string) => {
        router.get(`/locale/${lang}`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isSolid ? "bg-white shadow" : "bg-transparent"
                }`}
        >
            <div className="flex items-center justify-between px-4 lg:px-20 py-4">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-widest">
                    <img
                        width={125}
                        height={48}
                        src={scrolled ? LogoColor : LogoWhite}
                        alt="Logo"
                        className="transition-all duration-300"
                    />
                </Link>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Location */}
                    <span
                        className={`flex items-center gap-1 text-xl transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"
                            }`}
                    >
                        <IoLocationOutline /> Purwokerto
                    </span>

                    {/* Language Dropdown */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setOpenLang(!openLang)}
                            className={`flex items-center gap-2 text-xl transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"
                                }`}
                        >
                            <img
                                src={locale === "id" ? SvgId : SvgUk}
                                alt={locale === "id" ? "Indonesia" : "English"}
                                className="w-6 h-6"
                            />
                        </button>

                        {openLang && (
                            <div className="absolute right-0 mt-2 bg-white rounded shadow text-sm overflow-hidden">
                                <button
                                    onClick={() => {
                                        changeLanguage("id");
                                        setOpenLang(false);
                                    }}
                                    className="flex items-center gap-2 px-8 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                                >
                                    <img src={SvgId} alt="Indonesia" className="w-5 h-5 -ml-4" />
                                    Indonesia
                                </button>
                                <button
                                    onClick={() => {
                                        changeLanguage("en");
                                        setOpenLang(false);
                                    }}
                                    className="flex items-center gap-2 px-8 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                                >
                                    <img src={SvgUk} alt="English" className="w-5 h-5 -ml-4" />
                                    English
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User / Login */}
                    {!auth?.user ? (
                        <Link href="/login">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`rounded-none ${scrolled ? "text-primary border-primary hover:bg-primary/10" : "text-white border-white hover:bg-primary/50"
                                    }`}
                            >
                                {t("login")}
                            </Button>
                        </Link>
                    ) : (
                        <div className="relative" ref={userRef}>
                            <button
                                onClick={() => setOpenUser(!openUser)}
                                className={`flex items-center gap-2 transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"
                                    }`}
                            >
                                <LuUser className="w-5 h-5" />
                            </button>
                            {openUser && (
                                <div className="absolute right-0 mt-2 bg-white rounded shadow text-sm min-w-[150px]">
                                    <Link href="/" className="block px-4 py-2 hover:bg-gray-100">{t("home")}</Link>
                                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">{t("profile")}</Link>
                                    <Link href="/tickets" className="block px-4 py-2 hover:bg-gray-100">{t("tickets")}</Link>
                                    <Link href="/transactions" className="block px-4 py-2 hover:bg-gray-100">{t("transactions")}</Link>
                                    <Link href="/logout" method="post" as="button" className="w-full px-4 py-2 text-start hover:bg-gray-100 text-red-600">{t("logout")}</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className={`md:hidden text-3xl transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"
                        }`}
                    onClick={() => setOpenMenu(!openMenu)}
                >
                    {openMenu ? <HiX /> : <HiMenuAlt3 />}
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {openMenu && (
                <div className="md:hidden bg-black/90 text-white px-6 py-4 space-y-4">
                    {/* Location */}
                    <span className="flex items-center gap-2 text-lg">
                        <IoLocationOutline /> Purwokerto
                    </span>

                    {/* Language */}
                    <div>
                        <button
                            onClick={() => setOpenLang(!openLang)}
                            className="flex items-center gap-2 text-lg cursor-pointer"
                        >
                            <img
                                src={locale === "id" ? SvgId : SvgUk}
                                alt={locale === "id" ? "Indonesia" : "English"}
                                className="w-6 h-6"
                            />
                            {locale === "id" ? "Indonesia" : "English"}
                        </button>
                        {openLang && (
                            <div className="mt-2 bg-white rounded shadow text-black text-sm overflow-hidden">
                                <button
                                    onClick={() => {
                                        changeLanguage("id");
                                        setOpenLang(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                                >
                                    <img src={SvgId} alt="Indonesia" className="w-5 h-5" />
                                    Indonesia
                                </button>
                                <button
                                    onClick={() => {
                                        changeLanguage("en");
                                        setOpenLang(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                                >
                                    <img src={SvgUk} alt="English" className="w-5 h-5" />
                                    English
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User / Login */}
                    {!auth?.user ? (
                        <Link href="/login">
                            <Button variant="outline" size="sm" className="rounded-none w-full">
                                {t("login")}
                            </Button>
                        </Link>
                    ) : (
                        <div className="space-y-2">
                            <Link href="/" className="block px-4 py-2 hover:bg-white/10 rounded">{t("home")}</Link>
                            <Link href="/profile" className="block px-4 py-2 hover:bg-white/10 rounded">{t("profile")}</Link>
                            <Link href="/tickets" className="block px-4 py-2 hover:bg-white/10 rounded">{t("tickets")}</Link>
                            <Link href="/transactions" className="block px-4 py-2 hover:bg-white/10 rounded">{t("transactions")}</Link>
                            <Link href="/logout" method="post" as="button" className="block w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded">{t("logout")}</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
