import { Head } from '@inertiajs/react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import ReportTable from './Components/table/ReportTable';

export default function Report() {
    return (
        <DashboardLayout>
            <Head title="Laporan" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <ReportTable/>
                </div>
            </div>
        </DashboardLayout>
    );
}
