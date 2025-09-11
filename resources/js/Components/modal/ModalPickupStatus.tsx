import { useState } from "react";
import { Modal } from "@/Components/ui/modal";
import Button from "@/Components/ui/button/Button";
import Select from "@/Components/form/Select";
import Label from "@/Components/form/Label";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";

export const ModalPickupStatusUpdate = ({ isOpen, onClose, transactionId }: { isOpen: boolean; onClose: () => void; transactionId: string }) => {
    const [pickupStatus, setPickupStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(route("transaction.updatePickupStatus", transactionId), { pickup_status: pickupStatus }, {
            onSuccess: () => {
                toast.success("Status pengambilan barang berhasil diperbarui");
                setLoading(false);
                onClose();
            },
            onError: () => {
                toast.error("Gagal memperbarui status pengambilan barang");
                setLoading(false);
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] h-[250px] m-4">
            <div className="p-6">
                <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Status Pengambilan Barang
                </h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label required={true}>Status Pengambilan</Label>
                        <Select
                            value={pickupStatus}
                            onChange={(value) => setPickupStatus(value)}
                            options={[
                                { value: "pending", label: "Belum Diambil" },
                                { value: "picked_up", label: "Sudah Diambil" },
                            ]}
                            placeholder="Pilih status pengambilan"
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
