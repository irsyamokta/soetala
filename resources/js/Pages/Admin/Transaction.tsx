import { Head } from '@inertiajs/react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import TransactionTable from './Components/table/TransactionTable';

export default function Transaction() {
    return (
        <DashboardLayout>
            <Head title="Transaksi" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <TransactionTable />
                </div>
            </div>
        </DashboardLayout>
    );
}
