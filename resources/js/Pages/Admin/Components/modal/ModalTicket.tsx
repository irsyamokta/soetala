import { useEffect, useState, useCallback } from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import DatePicker from "@/Components/form/date-picker";
import TimeSelect from "@/Components/form/TimeSelect";
import CurrencyInput from "@/Components/form/input/CurrencyInput";
import Select from "@/Components/form/Select";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";
import { formatDate } from "@/utils/formateDate";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface TicketCategory {
    _id: string;
    category_name: string;
    description: string;
    price: number;
}

interface FormShape {
    thumbnail: File | null;
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    visibility: boolean;
    categories: TicketCategory[];
}

interface ModalTicketProps {
    isOpen: boolean;
    onClose: () => void;
    ticket?: any | null;
}

export const ModalTicket = ({ isOpen, onClose, ticket }: ModalTicketProps) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const blankCategory = (): TicketCategory => ({
        _id: uuidv4(),
        category_name: "",
        description: "",
        price: 0,
    });

    const initialFormData: FormShape = {
        thumbnail: null,
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        visibility: true,
        categories: [blankCategory()],
    };

    const { data, setData, reset } = useForm<FormShape>(initialFormData);

    useEffect(() => {
        if (!isOpen) {
            reset();
            setImageFile(null);
            return;
        }

        if (ticket) {
            const mapped = Array.isArray(ticket.categories)
                ? ticket.categories.map((cat: any) => ({
                    _id: cat?._id ?? uuidv4(),
                    category_name: cat?.category_name ?? "",
                    description: cat?.description ?? "",
                    price: typeof cat?.price === "number" ? cat.price : Number(cat?.price ?? 0),
                }))
                : [blankCategory()];

            setData({
                thumbnail: null,
                title: ticket.title ?? "",
                description: ticket.description ?? "",
                location: ticket.location ?? "",
                start_date: ticket.start_date ? formatDate(ticket.start_date) : "",
                end_date: ticket.end_date ? formatDate(ticket.end_date) : "",
                start_time: ticket.start_time ?? "",
                end_time: ticket.end_time ?? "",
                visibility: ticket.visibility ?? true,
                categories: mapped,
            });
        } else {
            setData({ ...initialFormData, categories: [blankCategory()] });
        }

        setServerErrors({});
        setImageFile(null);
    }, [isOpen, ticket, reset, setData]);

    const handleCategoryChange = useCallback(
        (idx: number, field: keyof Omit<TicketCategory, "_id">, value: any) => {
            setData((prev) => ({
                ...prev,
                categories: prev.categories.map((c, i) =>
                    i === idx
                        ? {
                            ...c,
                            [field]:
                                field === "price"
                                    ? (typeof value === "number" ? value : Number(value ?? 0)) || 0
                                    : (value ?? ""),
                        }
                        : c
                ),
            }));
        },
        [setData]
    );

    const addCategory = () =>
        setData((prev) => ({ ...prev, categories: [...prev.categories, blankCategory()] }));

    const removeCategory = (idx: number) =>
        setData((prev) => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== idx),
        }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === "thumbnail" && value instanceof File) {
                formData.append(key, value);
                return;
            }
            if (key === "visibility") {
                formData.append(key, data.visibility ? "1" : "0");
                return;
            }
            if (key === "categories" && Array.isArray(value)) {
                value.forEach((cat, index) => {
                    formData.append(`categories[${index}][category_name]`, cat.category_name ?? "");
                    formData.append(`categories[${index}][description]`, cat.description ?? "");
                    formData.append(`categories[${index}][price]`, String(cat.price ?? 0));
                });
                return;
            }
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        const postOptions = {
            forceFormData: true,
            onSuccess: () => {
                toast.success(ticket ? "Tiket berhasil diperbarui" : "Tiket berhasil ditambahkan");
                reset();
                setImageFile(null);
                onClose();
            },
            onError: (errors: any) => setServerErrors(errors),
            onFinish: () => setLoading(false),
        } as const;

        if (ticket) {
            formData.append("_method", "PATCH");
            router.post(route("ticket.update", ticket.id), formData, postOptions);
        } else {
            router.post(route("ticket.store"), formData, postOptions);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <h4 className="text-2xl font-semibold mb-4">{ticket ? "Edit Tiket" : "Tambah Tiket"}</h4>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                            e.preventDefault();
                        }
                    }}
                >
                    {/* Thumbnail */}
                    <div>
                        <Label required={true}>Thumbnail</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setData("thumbnail", file);
                                setImageFile(file);
                            }}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                        />
                        {serverErrors.thumbnail && <p className="text-xs text-red-500 mt-1">{serverErrors.thumbnail}</p>}
                    </div>

                    {/* Title */}
                    <div>
                        <Label required={true}>Judul</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="Masukkan judul"
                        />
                        {serverErrors.title && <p className="text-xs text-red-500 mt-1">{serverErrors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label required={true}>Deskripsi</Label>
                        <RichTextEditor
                            value={data.description ?? ""}                // controlled
                            onChange={(v: string) => setData("description", v ?? "")}
                        />
                        {serverErrors.description && <p className="text-xs text-red-500 mt-1">{serverErrors.description}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <Label required={true}>Lokasi</Label>
                        <Input
                            value={data.location}
                            onChange={(e) => setData("location", e.target.value)}
                            placeholder="Masukkan lokasi"
                        />
                        {serverErrors.location && <p className="text-xs text-red-500 mt-1">{serverErrors.location}</p>}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required={true}>Tanggal Mulai</Label>
                            <DatePicker
                                id="start_date"
                                value={data.start_date}
                                placeholder="Pilih tanggal mulai"
                                onChange={(dateStr) => setData("start_date", dateStr)}
                            />
                            {serverErrors.start_date && <p className="text-xs text-red-500 mt-1">{serverErrors.start_date}</p>}
                        </div>
                        <div>
                            <Label required={true}>Tanggal Selesai</Label>
                            <DatePicker
                                id="end_date"
                                value={data.end_date}
                                placeholder="Pilih tanggal selesai"
                                onChange={(dateStr) => setData("end_date", dateStr)}
                            />
                            {serverErrors.end_date && <p className="text-xs text-red-500 mt-1">{serverErrors.end_date}</p>}
                        </div>
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required={true}>Jam Mulai</Label>
                            <TimeSelect
                                value={data.start_time}
                                onChange={(val) => setData("start_time", val)}
                            />
                            {serverErrors.start_time && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.start_time}</p>
                            )}
                        </div>
                        <div>
                            <Label required={true}>Jam Selesai</Label>
                            <TimeSelect
                                value={data.end_time}
                                onChange={(val) => setData("end_time", val)}
                            />
                            {serverErrors.end_time && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.end_time}</p>
                            )}
                        </div>
                    </div>

                    {/* Visibility */}
                    <div>
                        <Label required={true}>Visibility</Label>
                        <Select
                            value={data.visibility ? "1" : "0"}
                            onChange={(value) => setData("visibility", value === "1")}
                            options={[
                                { value: "1", label: "Publik" },
                                { value: "0", label: "Privat" },
                            ]}
                        />
                        {serverErrors.visibility && <p className="text-xs text-red-500 mt-1">{serverErrors.visibility}</p>}
                    </div>

                    {/* Categories */}
                    <div>
                        <Label className="mb-3 mt-3 font-bold">Kategori Tiket</Label>
                        {serverErrors.categories && <p className="text-xs text-red-500 mt-1 mb-4">{serverErrors.categories}</p>}

                        {data.categories.map((cat, index) => (
                            <div key={cat._id} className="mb-3 flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label required={true}>Nama Kategori</Label>
                                        <Select
                                            value={cat.category_name}
                                            onChange={(val) => handleCategoryChange(index, "category_name", val)}
                                            options={[
                                                { value: "Dewasa", label: "Dewasa" },
                                                { value: "Anak", label: "Anak" },
                                            ]}
                                        />
                                        {serverErrors[`categories.${index}.category_name`] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {serverErrors[`categories.${index}.category_name`]}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label required={true}>Harga</Label>
                                        <CurrencyInput
                                            value={Number(cat.price ?? 0)}
                                            onChange={(val) => handleCategoryChange(index, "price", val)}
                                        />
                                        {serverErrors[`categories.${index}.price`] && (
                                            <p className="text-xs text-red-500 mt-1">{serverErrors[`categories.${index}.price`]}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label required={true}>Deskripsi</Label>
                                    <RichTextEditor
                                        value={cat.description ?? ""} // controlled string
                                        onChange={(v: string) => handleCategoryChange(index, "description", v ?? "")}
                                    />
                                    {serverErrors[`categories.${index}.description`] && (
                                        <p className="text-xs text-red-500 mt-1">{serverErrors[`categories.${index}.description`]}</p>
                                    )}
                                </div>

                                <Button type="button" variant="danger" onClick={() => removeCategory(index)}>
                                    Hapus Kategori
                                </Button>
                            </div>
                        ))}

                        <div
                            onClick={addCategory}
                            className="inline-flex text-sm items-center justify-center py-2 gap-2 rounded-lg border border-dashed border-primary bg-transparent w-full cursor-pointer"
                        >
                            Tambah Kategori Tiket
                        </div>
                    </div>

                    {/* Actions */}
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
