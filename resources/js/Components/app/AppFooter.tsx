import { Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import { MdOutlineEmail } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import LogoWhite from "../../../assets/logo/logo-white.png";

export default function Footer() {
    const t = useTranslate();

    return (
        <footer className="bg-secondary text-white py-10 px-6">
            <div className="lg:px-14 grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Logo & Location */}
                <div>
                    <img src={LogoWhite} alt="" className="w-40 mb-6"/>
                    <p className="text-sm leading-relaxed">
                        Jl. Patimura No.240a, RW No.1, Dusun II, Pasir Kidul,
                        Kec. Purwokerto Barat, Kabupaten Banyumas, Jawa Tengah 53136
                    </p>
                </div>

                {/* Initiator */}
                <div>
                    <h2 className="font-semibold mb-4">{t("footer.initiator")}</h2>
                    <ul className="text-sm space-y-2">
                        <li>Gilang Ramadhan, S.Sn., M.Sn</li>
                        <li>Ratih Alifah Putri, S.Ds., M.Ds</li>
                        <li>Sarah Astiti, S.Kom., M.MT</li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h2 className="font-semibold mb-4">{t("footer.help")}</h2>
                    <ul className="text-sm space-y-2">
                        <li className="hover:underline">
                            <Link href={"/kebijakan-privasi"}>{t("footer.privacy")}</Link>
                        </li>
                        <li className="hover:underline">
                            <Link href={"/ketentuan-layanan"}>{t("footer.terms")}</Link>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h2 className="font-semibold mb-4">{t("footer.contact")}</h2>
                    <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                            <MdOutlineEmail className="w-4 h-4" />
                            <a
                                href="mailto:soetala.lab@gmail.com"
                                className="hover:underline"
                            >
                                soetala.lab@gmail.com
                            </a>
                        </li>
                        <li className="flex items-center gap-2">
                            <FaInstagram className="w-4 h-4" />
                            <a
                                href="https://instagram.com/soedirmandigitalart"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                @soedirmandigitalart
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Location (Map) */}
                <div>
                    <h2 className="font-semibold mb-4">{t("footer.location")}</h2>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15825.39639912233!2d109.18801272321781!3d-7.426564086054662!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655e2206f5efab%3A0xdac7319e3757502a!2sMuseum%20Panglima%20Besar%20TNI%20Jenderal%20Sudirman!5e0!3m2!1sid!2sid!4v1756382583703!5m2!1sid!2sid"
                        className="w-full h-52 rounded-xl border-0"
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-10 border-t border-white/40 pt-4 text-center text-sm">
                © {new Date().getFullYear()} Soetala. {t("footer.copyright")}
            </div>
        </footer>
    );
}
