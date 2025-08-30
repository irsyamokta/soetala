import useTranslate from "@/hooks/useTranslate";
import AuthLayout from "@/Components/auth/AuthLayout";
import Login from "@/Components/auth/Login";
import Logo from "../../../assets/logo/logo-white.png";

export default function LoginPage() {
    const t = useTranslate();
    
    return (
        <>
            <AuthLayout
                logo={Logo}
                subtitle={t("quote-1")}
            >
                <Login />
            </AuthLayout>
        </>
    );
}
