import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import PageBreadcrumb from "@/Components/ui/breadcrumb/Breadcrumb";
import UserMetaCard from "@/Components/profile/UserMetaCard";
import UserInfoCard from "@/Components/profile/UserInfoCard";
import DashboardLayout from "@/Layouts/DashboardLayout";
import ChangePasswordCard from "@/Components/profile/ChangePasswordCard";
import AppNavbar from "@/Components/app/AppNavbar";
// import DeleteProfile from "@/Components/profile/DeleteProfile";

export default function UserProfiles() {
    const { auth }: any = usePage().props;
    const role = auth?.user?.role;

    const [lang, setLang] = useState("id");

    const t = useTranslate();

    const content = (
        <>
            <Head title={t("profile.title")} />
            <PageBreadcrumb pageTitle="Profile" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7">
                    Profile
                </h3>
                <div className="space-y-6">
                    <UserMetaCard />
                    <UserInfoCard />
                    {role !== "volunteer" && <ChangePasswordCard />}
                </div>
            </div>
        </>
    );

    if (role === "visitor") {
        return (
            <div className="min-h-screen flex flex-col">
                <AppNavbar lang={lang} setLang={setLang} forceSolid={true} />

                <Head title={t("profile.title")} />
                <div className="pt-20 lg:pt-24 px-4 lg:px-20 mb-4">
                    <div className="relative rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white lg:mb-7">
                            {t("profile.title")}
                        </h3>
                        <div className="space-y-6">
                            <UserMetaCard />
                            <UserInfoCard />
                            <ChangePasswordCard />
                            {/* <DeleteProfile /> */}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <DashboardLayout>{content}</DashboardLayout>;
}
