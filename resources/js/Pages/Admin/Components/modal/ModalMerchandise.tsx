import { useEffect, useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { toast } from "react-toastify";

import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import CurrencyInput from "@/Components/form/input/CurrencyInput";
import TextArea from "@/Components/form/input/TextArea";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LuTrash2 } from "react-icons/lu";

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface useFormProps {
    thumbnail: File | null;
    images: File[];
    product_name: string;
    description: string;
    category_id: string;
    price: number;
    visibility: boolean;
    variants: Variant[];
}

interface ModalMerchandiseProps {
    isOpen: boolean;
    onClose: () => void;
    merchandise?: any | null;
    categories?: { value: string; label: string }[];
}

export const ModalMerchandise = ({ isOpen, onClose, merchandise, categories = [] }: ModalMerchandiseProps) => {
    const { props }: any = usePage();
    const productCategories = props.categories || [];

    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    const [existingImages, setExistingImages] = useState<any[]>([]);

    const initialFormData: useFormProps = {
        thumbnail: null,
        images: [],
        product_name: "",
        description: "",
        category_id: "",
        price: 0,
        visibility: true,
        variants: [{ size: "", color: "", stock: 0 }],
    };

    const { data, setData, reset } = useForm<useFormProps>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (merchandise) {
                setExistingImages(merchandise.images ??  []);

                const variants = Array.isArray(merchandise.variants) && merchandise.variants.length > 0
                    ? merchandise.variants.map((variant: any) => ({
                        size: variant.size || "",
                        color: variant.color || "",
                        stock: Number(variant.stock) || 0,
                    }))
                    : [{ size: "", color: "", stock: 0 }];

                setData({
                    thumbnail: null,
                    images: [],
                    product_name: merchandise.product_name || "",
                    description: merchandise.description || "",
                    category_id: merchandise.category_id || "",
                    price: merchandise.price || 0,
                    visibility: merchandise.visibility ?? true,
                    variants,
                });
            } else {
                reset();
                setExistingImages([]);
            }
            setServerErrors({});
        } else {
            reset();
            setExistingImages([]);
        }
    }, [isOpen, merchandise, reset]);

    const handleAddVariant = () => {
        setServerErrors({});
        setData("variants", [...data.variants, { size: "", color: "", stock: 0 }]);
    };

    const handleRemoveVariant = (index: number) => {
        setServerErrors({});
        setData(
            "variants",
            data.variants.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === "thumbnail" && value instanceof File) {
                formData.append("thumbnail", value);
            } else if (key === "images" && Array.isArray(value)) {
                value.forEach((file) => file instanceof File && formData.append("images[]", file));
            } else if (key === "variants" && Array.isArray(value)) {
                value.forEach((variant, i) => {
                    formData.append(`variants[${i}][size]`, variant.size || "");
                    formData.append(`variants[${i}][color]`, variant.color || "");
                    formData.append(`variants[${i}][stock]`, String(variant.stock || 0));
                });
            } else if (key === "visibility") {
                formData.append("visibility", value ? "1" : "0");
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (merchandise) {
            formData.append("_method", "PATCH");
            router.post(route("merchandise.update", merchandise.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Produk berhasil diperbarui");
                    reset();
                    onClose();
                },
                onError: (errors) => setServerErrors(errors),
                onFinish: () => setLoading(false),
            });
        } else {
            router.post(route("merchandise.store"), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Produk berhasil ditambahkan");
                    reset();
                    onClose();
                },
                onError: (errors) => setServerErrors(errors),
                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <h4 className="text-2xl font-semibold mb-4">{merchandise ? "Edit Merchandise" : "Tambah Merchandise"}</h4>
                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {/* Thumbnail */}
                    <div>
                        <Label required={true}>Thumbnail</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setData("thumbnail", file);
                            }}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                        />
                        {serverErrors.thumbnail && <p className="text-xs text-red-500 mt-1">{serverErrors.thumbnail}</p>}
                        {data.thumbnail && (
                            <div className="mt-2 relative w-32 h-32">
                                <img
                                    src={URL.createObjectURL(data.thumbnail)}
                                    alt="Thumbnail Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    onClick={() => setData("thumbnail", null)}
                                >
                                    <LuTrash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Images */}
                    <div>
                        <input
                            id="product-images"
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) =>
                                setData("images", [...data.images, ...Array.from(e.target.files || [])])
                            }
                        />

                        {/* Preview */}
                        <div className="grid grid-cols-6 gap-2 mt-3">
                            {data.images.map((img, index) => (
                                <div key={index} className="relative w-24 h-24">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        onClick={() =>
                                            setData(
                                                "images",
                                                data.images.filter((_, i) => i !== index)
                                            )
                                        }
                                    >
                                        <LuTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <div
                                onClick={() => document.getElementById("product-images")?.click()}
                                className="inline-flex text-xs items-center justify-center py-6 gap-2 rounded-lg border border-dashed border-primary bg-transparent w-full cursor-pointer"
                            >
                                <p className="text-center">Tambah Gambar Produk</p>
                            </div>
                        </div>

                        {/* If merchandise has images */}
                        {existingImages.length > 0 && (
                            <div className="mt-3">
                                <Label>Pratinjau</Label>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {existingImages.map((img: any) => (
                                        <div key={img.id} className="relative w-24 h-24">
                                            <img
                                                src={img.image}
                                                alt="Old"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                onClick={() => {
                                                    router.delete(route("merchandise.images.destroy", img.id), {
                                                        onSuccess: () => {
                                                            toast.success("Gambar dihapus");
                                                            setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
                                                        },
                                                    });
                                                }}
                                            >
                                                <LuTrash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* product Name & Visibility */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <Label required={true}>Nama Produk</Label>
                            <Input
                                value={data.product_name}
                                onChange={(e) => setData("product_name", e.target.value)}
                                placeholder="Masukkan nama produk"
                            />
                            {serverErrors.product_name && <p className="text-xs text-red-500 mt-1">{serverErrors.product_name}</p>}
                        </div>
                        <div>
                            <Label required={true}>Visibilitas</Label>
                            <Select
                                value={data.visibility ? "1" : "0"}
                                onChange={(val) => setData("visibility", val === "1")}
                                options={[
                                    { value: "1", label: "Publik" },
                                    { value: "0", label: "Privat" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label required={true}>Deskripsi</Label>
                        <TextArea
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            rows={4}
                            placeholder="Masukkan deskripsi"
                            hint={serverErrors.description}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label required={true}>Kategori</Label>
                        <Select
                            value={data.category_id}
                            onChange={(val) => setData("category_id", val)}
                            options={productCategories.map((category: any) => ({
                                value: category.id,
                                label: category.category_name,
                            }))}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <Label required={true}>Harga</Label>
                        <CurrencyInput
                            value={data.price}
                            onChange={(val) => setData("price", val)}
                        />
                        {serverErrors.price && <p className="text-xs text-red-500 mt-1">{serverErrors.price}</p>}
                    </div>

                    {/* Variant */}
                    <div>
                        {data.variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
                                <div>
                                    <Label required={true}>Ukuran</Label>
                                    <Select
                                        value={variant.size}
                                        onChange={(val) => {
                                            const newVariants = [...data.variants];
                                            newVariants[index].size = val;
                                            setData("variants", newVariants);
                                        }}
                                        options={[
                                            { value: "S", label: "S" },
                                            { value: "M", label: "M" },
                                            { value: "L", label: "L" },
                                            { value: "XL", label: "XL" },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <Label required={true}>Warna</Label>
                                    <Select
                                        value={variant.color}
                                        onChange={(val) => {
                                            const newVariants = [...data.variants];
                                            newVariants[index].color = val;
                                            setData("variants", newVariants);
                                        }}
                                        options={[
                                            { value: "#ffffff", label: "Putih" },
                                            { value: "#000000", label: "Hitam" },
                                            { value: "#ff0000", label: "Merah" },
                                            { value: "#0914B7FF", label: "Navy" },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <Label required={true}>Stok</Label>
                                    <CurrencyInput
                                        value={variant.stock}
                                        onChange={(val) => {
                                            const newVariants = [...data.variants];
                                            newVariants[index].stock = val || 0;
                                            setData("variants", newVariants);
                                        }}
                                    />
                                </div>
                                <div className="w-full">
                                    <Label>&nbsp;</Label>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="w-full h-10 flex items-center justify-center"
                                    >
                                        <LuTrash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div onClick={handleAddVariant} className="inline-flex text-sm items-center justify-center py-2 gap-2 rounded-lg border border-dashed border-primary bg-transparent w-full cursor-pointer">
                            Tambah Varian
                        </div>
                    </div>

                    {/* Button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
