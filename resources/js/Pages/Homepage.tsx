import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import HeroSection from "./Homepage/HeroSection";
import AboutSection from "./Homepage/AboutSection";
import GallerySection from "./Homepage/GallerySection";
import Footer from "@/Components/app/AppFooter";
import TicketSection from "./Homepage/TicketSection";
import MerchandiseSection from "./Homepage/MerchandiseSection";

export default function Homepage() {
    return (
        <>
            <Head title="Homepage" />
            <AppLayout>
                <HeroSection />
                <AboutSection />
                <GallerySection />
                <TicketSection />
                <MerchandiseSection />
                <Footer />
            </AppLayout>
        </>
    );
}
