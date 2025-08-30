import useTranslate from "@/hooks/useTranslate";
import AuthLayout from "@/Components/auth/AuthLayout";
import Register from "@/Components/auth/Register";
import Logo from "../../../assets/logo/logo-white.png";

export default function RegisterPage() {
    const t = useTranslate();

    return (
        <>
            <AuthLayout
                logo={Logo}
                subtitle={t("quote-2")}
            >
                <Register />
            </AuthLayout>
        </>
    );
}
