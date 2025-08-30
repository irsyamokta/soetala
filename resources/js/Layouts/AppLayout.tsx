import { useState } from "react";
import { PropsWithChildren } from "react";
import AppNavbar from "@/Components/app/AppNavbar";

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
    const [lang, setLang] = useState("id");

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <AppNavbar lang={lang} setLang={setLang} />

            {/* Main Content */}
            <main className="overflow-hidden">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;
