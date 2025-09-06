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
    id?: string;
    size: string;
    color: string;
    stock: number;
    image?: File | null;
    existingImage?: string;
    existingPublicId?: string;
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
    stock: number;
}

interface ModalMerchandiseProps {
    isOpen: boolean;
    onClose: () => void;
    merchandise?: any | null;
    categories?: { value: string; label: string }[];
}

export const ModalMerchandise = ({
    isOpen,
    onClose,
    merchandise,
    categories = [],
}: ModalMerchandiseProps) => {
    const { props }: any = usePage();
    const productCategories = props.categories || [];

    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [categoryType, setCategoryType] = useState<string>('');
    const [existingThumbnail, setExistingThumbnail] = useState<string>('');

    const initialFormData: useFormProps = {
        thumbnail: null,
        images: [],
        product_name: "",
        description: "",
        category_id: "",
        price: 0,
        visibility: true,
        variants: [],
        stock: 0,
    };

    const { data, setData, reset } = useForm<useFormProps>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (merchandise) {
                setExistingImages(merchandise.images ?? []);
                setExistingThumbnail(merchandise.thumbnail || '');

                const selectedCat = productCategories.find((c: any) => c.id === merchandise.category_id);
                const catType = selectedCat?.category_name.toLowerCase() || '';
                setCategoryType(catType);

                const commonData = {
                    thumbnail: null,
                    images: [],
                    product_name: merchandise.product_name || "",
                    description: merchandise.description || "",
                    category_id: merchandise.category_id || "",
                    price: merchandise.price || 0,
                    visibility: merchandise.visibility ?? true,
                };

                if (catType === 'sticker') {
                    setData({
                        ...commonData,
                        stock: Number(merchandise.variants[0]?.stock) || 0,
                        variants: [],
                    });
                } else {
                    const variants = Array.isArray(merchandise.variants) && merchandise.variants.length > 0
                        ? merchandise.variants.map((variant: any) => ({
                            id: variant.id,
                            size: variant.size || "",
                            color: variant.color || "",
                            stock: Number(variant.stock) || 0,
                            image: null,
                            existingImage: variant.image || "",
                            existingPublicId: variant.public_id || "",
                        }))
                        : [{ size: "", color: "", stock: 0, image: null }];
                    setData({
                        ...commonData,
                        variants,
                        stock: 0,
                    });
                }
            } else {
                setExistingImages([]);
                setExistingThumbnail('');
                setCategoryType('');
                reset();
            }
        } else {
            reset();
            setExistingImages([]);
            setExistingThumbnail('');
            setCategoryType('');
            setServerErrors({});
        }
    }, [isOpen, merchandise?.id]);

    useEffect(() => {
        const selectedCat = productCategories.find((c: any) => c.id === data.category_id);
        const newCatType = selectedCat?.category_name.toLowerCase() || '';
        if (newCatType !== categoryType) {
            setCategoryType(newCatType);
            if (newCatType === 'sticker') {
                setData('variants', []);
                setData('stock', 0);
            } else if (newCatType === 'shirt') {
                setData('variants', [{ size: "", color: "", stock: 0, image: null }]);
                setData('stock', 0);
            }
        }
    }, [data.category_id, productCategories, categoryType]);

    const handleAddVariant = () => {
        setServerErrors({});
        setData("variants", [...data.variants, { size: "", color: "", stock: 0, image: null }]);
    };

    const handleRemoveVariant = (index: number) => {
        setServerErrors({});
        setData("variants", data.variants.filter((_, i) => i !== index));
    };

    // Handle thumbnail removal
    const handleRemoveThumbnail = () => {
        setData("thumbnail", null);
        setExistingThumbnail('');
    };

    // Handle new uploaded image removal
    const handleRemoveNewImage = (index: number) => {
        setData("images", data.images.filter((_, i) => i !== index));
    };

    // Handle existing product image removal
    const handleRemoveExistingImage = (imageId: string) => {
        router.delete(route("merchandise.images.destroy", imageId), {
            preserveState: true,
            onSuccess: () => {
                toast.success("Gambar dihapus");
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
            },
            onError: () => {
                toast.error("Gagal menghapus gambar");
            },
        });
    };

    // Handle variant image removal
    const handleRemoveVariantImage = (index: number) => {
        const variant = data.variants[index];

        if (variant.id && variant.existingImage) {
            router.delete(route("merchandise.variants.image.destroy", variant.id), {
                onSuccess: () => {
                    toast.success("Image variant dihapus");
                    const newVariants = [...data.variants];
                    newVariants[index] = {
                        ...newVariants[index],
                        existingImage: "",
                        existingPublicId: "",
                    };
                    setData("variants", newVariants);
                },
                onError: () => {
                    toast.error("Gagal menghapus image variant");
                },
            });
        } else {
            const newVariants = [...data.variants];
            newVariants[index] = {
                ...newVariants[index],
                image: null,
            };
            setData("variants", newVariants);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let submitData = { ...data };

        if (categoryType === 'sticker') {
            submitData.variants = [{ size: "", color: "", stock: submitData.stock || 0, image: null }];
        }

        const formData = new FormData();

        // Add thumbnail
        if (submitData.thumbnail instanceof File) {
            formData.append("thumbnail", submitData.thumbnail);
        }

        // Add new images
        if (Array.isArray(submitData.images)) {
            submitData.images.forEach((file) => {
                if (file instanceof File) {
                    formData.append("images[]", file);
                }
            });
        }

        // Add variants
        if (Array.isArray(submitData.variants)) {
            submitData.variants.forEach((variant, i) => {
                if (variant.id) {
                    formData.append(`variants[${i}][id]`, String(variant.id));
                }
                formData.append(`variants[${i}][size]`, variant.size || "");
                formData.append(`variants[${i}][color]`, variant.color || "");
                formData.append(`variants[${i}][stock]`, String(variant.stock || 0));

                if (variant.image instanceof File) {
                    formData.append(`variants[${i}][image]`, variant.image);
                } else if (variant.existingImage) {
                    formData.append(`variants[${i}][existingImage]`, variant.existingImage);
                    if (variant.existingPublicId) {
                        formData.append(`variants[${i}][existingPublicId]`, variant.existingPublicId);
                    }
                }
            });
        }

        formData.append("visibility", submitData.visibility ? "1" : "0");
        const otherFields = {
            product_name: submitData.product_name,
            description: submitData.description,
            category_id: submitData.category_id,
            price: submitData.price,
        };
        Object.entries(otherFields).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        const handleSuccess = () => {
            toast.success(merchandise ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
            setLoading(false);
            reset();
            setExistingImages([]);
            setExistingThumbnail('');
            onClose();
        };

        const handleError = (errors: any) => {
            const normalizedErrors: Record<string, string> = {};
            Object.entries(errors).forEach(([key, val]) => {
                const newKey = key.replace(/\[(\d+)\]/g, '.$1');
                normalizedErrors[newKey] = val as string;
            });
            setServerErrors(normalizedErrors);
            setLoading(false);
        };

        if (merchandise) {
            formData.append("_method", "PATCH");
            router.post(route("merchandise.update", merchandise.id), formData, {
                forceFormData: true,
                onSuccess: handleSuccess,
                onError: handleError,
                onFinish: () => setLoading(false),
            });
        } else {
            router.post(route("merchandise.store"), formData, {
                forceFormData: true,
                onSuccess: handleSuccess,
                onError: handleError,
                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                {/* Header */}
                <h4 className="text-2xl font-semibold mb-4">
                    {merchandise ? "Edit Merchandise" : "Tambah Merchandise"}
                </h4>

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
                                if (file) {
                                    setExistingThumbnail('');
                                }
                            }}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                        />
                        {serverErrors.thumbnail && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.thumbnail}</p>
                        )}

                        {/* Show new thumbnail */}
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
                                    onClick={handleRemoveThumbnail}
                                >
                                    <LuTrash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Images */}
                    <div>
                        <Label>Gambar Produk</Label>
                        <input
                            id="product-images"
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files || []);
                                setData("images", [...data.images, ...newFiles]);
                            }}
                        />

                        {/* Grid for all images */}
                        <div className="grid grid-cols-6 gap-2 mt-3">
                            {/* Existing images */}
                            {existingImages.map((img: any) => (
                                <div key={`existing-${img.id}`} className="relative w-24 h-24">
                                    <img
                                        src={img.image}
                                        alt="Existing"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                    >
                                        <LuTrash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* New uploaded images */}
                            {data.images.map((img, index) => (
                                <div key={`new-${index}`} className="relative w-24 h-24">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`New ${index}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        onClick={() => handleRemoveNewImage(index)}
                                    >
                                        <LuTrash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Add button */}
                            <div
                                onClick={() => document.getElementById("product-images")?.click()}
                                className="inline-flex text-xs items-center justify-center py-6 gap-2 rounded-lg border border-dashed border-primary bg-transparent w-24 h-24 cursor-pointer"
                            >
                                <p className="text-center">Tambah Gambar</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <Label required={true}>Nama Produk</Label>
                            <Input
                                value={data.product_name}
                                onChange={(e) => setData("product_name", e.target.value)}
                                placeholder="Masukkan nama produk"
                            />
                            {serverErrors.product_name && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.product_name}</p>
                            )}
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
                            {serverErrors.visibility && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.visibility}</p>
                            )}
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
                        {serverErrors.category_id && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.category_id}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <Label required={true}>Harga</Label>
                        <CurrencyInput
                            value={data.price}
                            onChange={(val) => setData("price", val)}
                        />
                        {serverErrors.price && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.price}</p>
                        )}
                    </div>

                    {/* Variants for Shirt */}
                    {categoryType === 'shirt' && (
                        <div>
                            <Label>Varian Produk</Label>
                            {data.variants.map((variant, index) => (
                                <div key={index} className="grid grid-cols-[auto,1fr] gap-3 items-start mb-4 p-4 border border-gray-300 rounded-lg">
                                    {/* Variant Image */}
                                    <div>
                                        <Label>Gambar Varian</Label>
                                        <input
                                            id={`variant-image-${index}`}
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                const newVariants = [...data.variants];
                                                newVariants[index] = {
                                                    ...newVariants[index],
                                                    image: file,
                                                    ...(file && { existingImage: "" })
                                                };
                                                setData("variants", newVariants);
                                            }}
                                        />

                                        {/* Show image preview */}
                                        {(variant.image || variant.existingImage) ? (
                                            <div className="mt-2 relative w-24 h-24">
                                                <img
                                                    src={
                                                        variant.image
                                                            ? URL.createObjectURL(variant.image)
                                                            : variant.existingImage
                                                    }
                                                    alt="Variant Preview"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                    onClick={() => handleRemoveVariantImage(index)}
                                                >
                                                    <LuTrash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => document.getElementById(`variant-image-${index}`)?.click()}
                                                className="mt-2 inline-flex text-xs items-center justify-center py-6 gap-2 rounded-lg border border-dashed border-primary bg-transparent w-24 h-24 cursor-pointer"
                                            >
                                                <p className="text-center">Tambah Gambar</p>
                                            </div>
                                        )}
                                        {serverErrors[`variants.${index}.image`] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {serverErrors[`variants.${index}.image`]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Variant Details */}
                                    <div className="grid grid-cols-2 gap-3 w-full">
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
                                            {serverErrors[`variants.${index}.size`] && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {serverErrors[`variants.${index}.size`]}
                                                </p>
                                            )}
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
                                            {serverErrors[`variants.${index}.color`] && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {serverErrors[`variants.${index}.color`]}
                                                </p>
                                            )}
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
                                            {serverErrors[`variants.${index}.stock`] && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {serverErrors[`variants.${index}.stock`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-end">
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
                                </div>
                            ))}

                            <div
                                onClick={handleAddVariant}
                                className="inline-flex text-sm items-center justify-center py-2 gap-2 rounded-lg border border-dashed border-primary bg-transparent w-full cursor-pointer"
                            >
                                Tambah Varian
                            </div>
                            {serverErrors.variants && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.variants}</p>
                            )}
                        </div>
                    )}

                    {/* Stock for Sticker */}
                    {categoryType === 'sticker' && (
                        <div>
                            <Label required={true}>Stok</Label>
                            <CurrencyInput
                                value={data.stock}
                                onChange={(val) => setData("stock", val || 0)}
                            />
                            {serverErrors["variants.0.stock"] && (
                                <p className="text-xs text-red-500 mt-1">
                                    {serverErrors["variants.0.stock"]}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            disabled={loading}
                        >
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
