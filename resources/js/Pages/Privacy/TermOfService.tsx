import { useState } from "react";
import { Head } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import AppNavbar from "@/Components/app/AppNavbar";
import Footer from "@/Components/app/AppFooter";

export default function TermsOfService() {
    const [lang, setLang] = useState("id");
    const t = useTranslate();

    return (
        <div className="min-h-screen flex flex-col">
            <AppNavbar lang={lang} setLang={setLang} forceSolid={true} />
            <Head title={t("terms.title")} />
            <div className="pt-20 lg:pt-24 px-4 lg:px-20 mb-4 md:mb-10">
                <div className="relative rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white lg:mb-7">
                        {t("terms.title")}
                    </h3>
                    <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        <p>{t("terms.intro")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section1.title")}</h4>
                        <p>{t("terms.section1.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section2.title")}</h4>
                        <p>{t("terms.section2.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section3.title")}</h4>
                        <p>{t("terms.section3.desc")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("terms.section3.prohibited1")}</li>
                            <li>{t("terms.section3.prohibited2")}</li>
                            <li>{t("terms.section3.prohibited3")}</li>
                        </ul>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section4.title")}</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("terms.section4.responsibility1")}</li>
                            <li>{t("terms.section4.responsibility2")}</li>
                            <li>{t("terms.section4.responsibility3")}</li>
                        </ul>
                        <p>{t("terms.section4.suspension")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section5.title")}</h4>
                        <p>{t("terms.section5.desc")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("terms.section5.point1")}</li>
                            <li>{t("terms.section5.point2")}</li>
                        </ul>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section6.title")}</h4>
                        <p>{t("terms.section6.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section7.title")}</h4>
                        <p>{t("terms.section7.desc")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("terms.section7.limitation1")}</li>
                            <li>{t("terms.section7.limitation2")}</li>
                            <li>{t("terms.section7.limitation3")}</li>
                        </ul>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section8.title")}</h4>
                        <p>{t("terms.section8.desc")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("terms.section8.termination1")}</li>
                            <li>{t("terms.section8.termination2")}</li>
                        </ul>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section9.title")}</h4>
                        <p>{t("terms.section9.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("terms.section10.title")}</h4>
                        <p>{t("terms.section10.email")}</p>
                        <p>{t("terms.section10.contact")}</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
