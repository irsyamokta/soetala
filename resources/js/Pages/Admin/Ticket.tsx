import { Head } from '@inertiajs/react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import TicketCard from './Components/card/TicketCard';

export default function Ticket() {
    return (
        <DashboardLayout>
            <Head title="Tiket" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <TicketCard />
                </div>
            </div>
        </DashboardLayout>
    );
}
