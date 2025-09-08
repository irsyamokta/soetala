import useTranslate from "@/hooks/useTranslate";
import { LuMinus, LuPlus, LuX } from "react-icons/lu";
import Button from "@/Components/ui/button/Button";
import { formatCurrency } from "@/utils/formatCurrency";

interface MerchVariant {
    color: string;
    size: string;
    stock: number;
}

interface Merch {
    id: number;
    product_name: string;
    price: number;
    variants: MerchVariant[];
}

interface MerchModalData {
    merch: Merch;
    color: string;
    size: string;
    note: string;
    quantity: number;
}

interface MerchandiseSelectionModalProps {
    isOpen: boolean;
    merchModal: any;
    setMerchModal: (data: any | null) => void;
    handleAddMerch: (merchData: any) => void;
}

export const ModalMerchandiseSelection = ({
    isOpen,
    merchModal,
    setMerchModal,
    handleAddMerch,
}: MerchandiseSelectionModalProps) => {
    if (!isOpen || !merchModal) return null;

    const t = useTranslate();

    const getSelectedStock = (merch: Merch, color: string, size: string) => {
        const variant = merch.variants?.find((v) => v.color === color && v.size === size);
        return variant?.stock || 0;
    };

    const getAvailableColors = (merch: Merch) => {
        return [...new Set(merch.variants?.map((v) => v.color) || [])];
    };

    const getAvailableSizes = (merch: Merch) => {
        return [...new Set(merch.variants?.map((v) => v.size) || [])];
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{merchModal.merch.product_name}</h3>
                    <button
                        onClick={() => setMerchModal(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <LuX size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Color Selection */}
                    {getAvailableColors(merchModal.merch).length > 0 && (
                        <div>
                            <p className="font-medium text-sm mb-2">{t("merch.modal.color")}</p>
                            <div className="flex gap-2 flex-wrap">
                                {getAvailableColors(merchModal.merch).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setMerchModal({ ...merchModal, color })}
                                        className={`w-10 h-10 rounded-full border-2 ${merchModal.color === color
                                            ? "border-blue-500 ring-2 ring-blue-200"
                                            : "border-gray-300"
                                            } hover:scale-105 transition-transform`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    {getAvailableSizes(merchModal.merch).length > 0 && (
                        <div>
                            <p className="font-medium text-sm mb-2">{t("merch.modal.size")}</p>
                            <div className="flex gap-2 flex-wrap">
                                {getAvailableSizes(merchModal.merch).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setMerchModal({ ...merchModal, size })}
                                        className={`px-3 py-2 border rounded ${merchModal.size === size
                                            ? "bg-primary text-white"
                                            : "bg-white border-gray-300 hover:border-primary"
                                            } transition-colors`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Info */}
                    <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm">
                            <span className="font-medium text-sm">{t("merch.modal.reminder")}: </span>
                            <span className="text-green-600 font-semibold text-sm">
                                {getSelectedStock(merchModal.merch, merchModal.color, merchModal.size)}
                            </span>
                        </p>
                    </div>

                    {/* Note */}
                    <div>
                        <p className="font-medium text-sm mb-2">{t("merch.modal.note")}</p>
                        <textarea
                            className="w-full text-sm px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Add any special instructions..."
                            rows={2}
                            value={merchModal.note}
                            onChange={(e) => setMerchModal({ ...merchModal, note: e.target.value })}
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <p className="font-medium text-sm mb-2">{t("merch.modal.quantity")}</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setMerchModal({
                                        ...merchModal,
                                        quantity: Math.max(1, merchModal.quantity - 1),
                                    })
                                }
                                className="px-3 py-2 border rounded hover:bg-gray-100"
                            >
                                <LuMinus size={16} />
                            </button>
                            <span className="px-4 py-2 font-medium text-sm min-w-[3rem] text-center">
                                {merchModal.quantity}
                            </span>
                            <button
                                onClick={() => {
                                    const stock = getSelectedStock(
                                        merchModal.merch,
                                        merchModal.color,
                                        merchModal.size
                                    );
                                    setMerchModal({
                                        ...merchModal,
                                        quantity: Math.min(stock, merchModal.quantity + 1),
                                    });
                                }}
                                className="px-3 py-2 border rounded hover:bg-gray-100"
                                disabled={
                                    merchModal.quantity >=
                                    getSelectedStock(merchModal.merch, merchModal.color, merchModal.size)
                                }
                            >
                                <LuPlus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Subtotal */}
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">Subtotal:</span>
                            <span className="font-semibold text-xl text-primary">
                                {formatCurrency(merchModal.merch.price * merchModal.quantity)}
                            </span>
                        </div>
                    </div>

                    {/* Add Button */}
                    <Button
                        onClick={() => handleAddMerch(merchModal)}
                        className="w-full py-3 text-lg"
                        disabled={getSelectedStock(merchModal.merch, merchModal.color, merchModal.size) === 0}
                    >
                        {getSelectedStock(merchModal.merch, merchModal.color, merchModal.size) > 0
                            ? t("merch.modal.button.add")
                            : t("merch.modal.button.disable")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
