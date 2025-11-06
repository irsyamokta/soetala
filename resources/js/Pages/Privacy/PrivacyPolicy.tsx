import { useState } from "react";
import { Head } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import AppNavbar from "@/Components/app/AppNavbar";
import Footer from "@/Components/app/AppFooter";

export default function PrivacyPolicy() {
    const [lang, setLang] = useState("id");
    const t = useTranslate();

    return (
        <div className="min-h-screen flex flex-col">
            <AppNavbar lang={lang} setLang={setLang} forceSolid={true} />
            <Head title={t("privacy.title")} />
            <div className="pt-20 lg:pt-24 px-4 lg:px-20 mb-4 md:mb-10">
                <div className="relative rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white lg:mb-7">
                        {t("privacy.title")}
                    </h3>

                    <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        <p>{t("privacy.intro")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("privacy.intro.point1")}</li>
                            <li>{t("privacy.intro.point2")}</li>
                            <li>{t("privacy.intro.point3")}</li>
                        </ul>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section1.title")}</h4>
                        <p><strong>Summary:</strong> {t("privacy.section1.summary")}</p>
                        <p>{t("privacy.section1.desc")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("privacy.section1.list1")}</li>
                            <li>{t("privacy.section1.list2")}</li>
                            <li>{t("privacy.section1.list3")}</li>
                            <li>{t("privacy.section1.list4")}</li>
                            <li>{t("privacy.section1.list5")}</li>
                        </ul>
                        <p><strong>{t("privacy.section1.note")}</strong></p>
                        <p>{t("privacy.section1.payment")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section2.title")}</h4>
                        <p><strong>Summary:</strong> {t("privacy.section2.summary")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("privacy.section2.point1")}</li>
                            <li>{t("privacy.section2.point2")}</li>
                        </ul>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section3.title")}</h4>
                        <p>{t("privacy.section3.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section4.title")}</h4>
                        <p>{t("privacy.section4.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section5.title")}</h4>
                        <p>{t("privacy.section5.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section6.title")}</h4>
                        <p>{t("privacy.section6.desc")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section7.title")}</h4>
                        <p>{t("privacy.section7.summary")}</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>{t("privacy.section7.point1")}</li>
                            <li>{t("privacy.section7.point2")}</li>
                        </ul>
                        <p>{t("privacy.section7.note")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section8.title")}</h4>
                        <p>{t("privacy.section8.email")}</p>
                        <p>{t("privacy.section8.contact")}</p>

                        <h4 className="text-xl font-semibold mt-6">{t("privacy.section9.title")}</h4>
                        <p>{t("privacy.section9.desc")}</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
