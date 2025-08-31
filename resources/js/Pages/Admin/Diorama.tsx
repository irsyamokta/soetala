import { Head } from '@inertiajs/react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import DioramaCard from './Components/card/DioramaCard';

export default function Diorama() {
    return (
        <DashboardLayout>
            <Head title="Diorama" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <DioramaCard />
                </div>
            </div>
        </DashboardLayout>
    );
}
