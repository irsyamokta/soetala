import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Swal from "sweetalert2";

type ScanTicketModalProps = {
    open: boolean;
    onClose: () => void;
    onResult: (value: string) => void;
};

export default function ModalScanTicket({ open, onClose, onResult }: ScanTicketModalProps) {
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-999">
            <div className="bg-white rounded-xl p-4 w-[400px] shadow-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    ✖
                </button>

                <h2 className="text-lg font-bold mb-2">Scan Tiket</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Arahkan kamera ke QR Code pada tiket
                </p>

                <div className="border rounded-md overflow-hidden">
                    <Scanner
                        onScan={(result) => {
                            if (result && result.length > 0) {
                                const value = result[0].rawValue;

                                Swal.fire({
                                    title: "Checkin Berhasil 🎉",
                                    text: `Pengunjung: ${value}`,
                                    icon: "success",
                                    confirmButtonText: "OK",
                                    confirmButtonColor: "#014C8F",
                                });

                                onResult(value);
                                onClose();
                            }
                        }}
                    />
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
}
