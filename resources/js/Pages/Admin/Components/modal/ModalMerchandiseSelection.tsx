import { useEffect, useState } from "react";
import { Modal } from "@/Components/ui/modal";
import Select from "@/Components/form/Select";
import TextArea from "@/Components/form/input/TextArea";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";
import { LuMinus, LuPlus } from "react-icons/lu";

interface Merch {
    id: string;
    product_name: string;
    price: number;
    category_name: string;
    variants: Variant[];
}

interface Variant {
    id?: string;
    color?: string;
    size?: string;
    stock: number;
}

const colorMap: Record<string, string> = {
    "#ffffff": "Putih",
    "#000000": "Hitam",
    "#ff0000": "Merah",
    "#0914B7FF": "Navy",
};

export const ModalMerchandiseSelection = ({
    isOpen,
    onClose,
    merch,
    handleAddMerch,
}: {
    isOpen: boolean;
    onClose: () => void;
    merch: Merch | null;
    handleAddMerch: (data: { merch: Merch; color: string; size: string; note: string; quantity: number }) => void;
}) => {
    if (!merch) return null;

    const categoryType = merch.category_name.toLowerCase();
    const isSticker = categoryType === "sticker";

    const [color, setColor] = useState(isSticker ? "" : merch.variants[0]?.color || "");
    const [size, setSize] = useState(isSticker ? "" : merch.variants[0]?.size || "");
    const [note, setNote] = useState("");
    const [quantity, setQuantity] = useState(1);

    const availableColors = [...new Set(merch.variants.map((v) => v.color).filter(Boolean))].map((c) => ({
        value: c || "",
        label: colorMap[c || ""] || c || "",
    }));

    const availableSizes = color
        ? merch.variants
            .filter((v) => v.color === color)
            .map((v) => ({ value: v.size || "", label: v.size || "" }))
        : [];

    const selectedVariant = merch.variants.find((v) => v.color === color && v.size === size);
    const currentStock = selectedVariant?.stock || (isSticker ? merch.variants[0]?.stock || 0 : 0);

    useEffect(() => {
        if (!isSticker && availableSizes.length > 0) {
            setSize(availableSizes[0].value);
        }
    }, [color, isSticker, availableSizes]);

    const handleIncreaseQty = () => {
        if (quantity < currentStock) setQuantity((q) => q + 1);
    };

    const handleDecreaseQty = () => {
        if (quantity > 1) setQuantity((q) => q - 1);
    };

    const onAdd = () => {
        handleAddMerch({ merch, color, size, note, quantity });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
            <div className="p-6">
                <h4 className="text-xl font-semibold mb-4">Pilih Varian untuk {merch.product_name}</h4>
                {!isSticker && (
                    <div className="mb-4">
                        <Label required={true}>Warna</Label>
                        <Select value={color} onChange={setColor} options={availableColors} />
                    </div>
                )}
                {!isSticker && (
                    <div className="mb-4">
                        <Label required={true}>Ukuran</Label>
                        <Select value={size} onChange={setSize} options={availableSizes} />
                    </div>
                )}
                <div className="mb-4">
                    <Label required={true}>Jumlah</Label>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDecreaseQty} className="px-2 py-1 border rounded">
                            <LuMinus size={16} />
                        </button>
                        <span className="w-8 text-center">{quantity}</span>
                        <button onClick={handleIncreaseQty} className="px-2 py-1 border rounded">
                            <LuPlus size={16} />
                        </button>
                        <p className="text-sm text-gray-500">Stok tersedia: {currentStock}</p>
                    </div>
                </div>
                <div className="mb-4">
                    <Label>Note (opsional)</Label>
                    <TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="button" variant="default" onClick={onAdd} disabled={quantity === 0 || currentStock === 0}>
                        Tambah ke Pesanan
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
