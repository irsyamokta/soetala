import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";

import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import CurrencyInput from "@/Components/form/input/CurrencyInput";
import Select from "@/Components/form/Select";
import MultiSelect from "@/Components/form/MultiSelect";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";
import { formatDate } from "@/utils/formateDate";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface useForm {
    thumbnail: File | null,
    category: string,
    description: string,
    location: string,
    start_date: string,
    end_date: string,
    start_time: string,
    end_time: string,
    online_price: number,
    offline_price: number,
    requirement: string[],
    visibility: boolean,
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

    const optionRequirement = [
        { value: "Berlaku untuk pengunjung usia 12 tahun ke atas.", text: "Berlaku untuk pengunjung usia 12 tahun ke atas." },
        { value: "Lebih hemat dengan pembelian online.", text: "Lebih hemat dengan pembelian online." },
        { value: "Berlaku untuk anak usia 3–11 tahun.", text: "Berlaku untuk anak usia 3–11 tahun." },
        { value: "Gratis untuk anak di bawah 3 tahun.", text: "Gratis untuk anak di bawah 3 tahun." },
        { value: "Tiket berlaku hanya untuk satu kali kunjungan", text: "Tiket berlaku hanya untuk satu kali kunjungan" },
    ];

    const initialFormData = {
        thumbnail: null as File | null,
        category: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        online_price: 0,
        offline_price: 0,
        requirement: [] as string[],
        visibility: true,
    };

    const { data, setData, reset } = useForm<useForm>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (ticket) {
                setData({
                    thumbnail: null,
                    category: ticket.category || "",
                    description: ticket.description || "",
                    location: ticket.location || "",
                    start_date: formatDate(ticket.start_date) || "",
                    end_date: formatDate(ticket.end_date) || "",
                    start_time: ticket.start_time || "",
                    end_time: ticket.end_time || "",
                    online_price: ticket.online_price || 0,
                    offline_price: ticket.offline_price || 0,
                    requirement: Array.isArray(ticket.requirement)
                        ? ticket.requirement
                        : ticket.requirement
                            ? JSON.parse(ticket.requirement)
                            : [],
                    visibility: ticket.visibility ?? true,
                });
                setImageFile(null);
            } else {
                reset();
                setImageFile(null);
            }
            setServerErrors({});
        } else {
            reset();
            setImageFile(null);
        }
    }, [isOpen, ticket, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === "thumbnail" && value instanceof File) {
                formData.append(key, value);
            } else if (key === "requirement" && Array.isArray(value)) {
                value.forEach((item) => formData.append("requirement[]", item));
            } else if (key === "visibility") {
                formData.append(key, value ? "1" : "0");
            } else if (typeof value === "number") {
                formData.append(key, value.toString());
            } else if (value !== null && value !== undefined) {
                formData.append(key, value as string);
            }
        });

        if (ticket) {
            formData.append('_method', 'PATCH');

            router.post(route("ticket.update", ticket.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Tiket berhasil diperbarui");
                    reset();
                    setImageFile(null);
                    onClose();
                },
                onError: (errors) => {
                    setServerErrors(errors);
                },
                onFinish: () => setLoading(false),
            });
        } else {
            router.post(route("ticket.store"), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Tiket berhasil ditambahkan");
                    reset();
                    setImageFile(null);
                    onClose();
                },
                onError: (errors) => {
                    setServerErrors(errors);
                },
                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <h4 className="text-2xl font-semibold mb-4">{ticket ? "Edit Tiket" : "Tambah Tiket"}</h4>
                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {/* Thumbnail */}
                    <div>
                        <Label required={true}>Thumbnail</Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setData("thumbnail", file || null);
                                setImageFile(file || null);
                            }}
                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                        />
                        {serverErrors.thumbnail && <p className="text-xs text-red-500 mt-1">{serverErrors.thumbnail}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <Label required={true}>Kategori</Label>
                        <Select
                            value={data.category}
                            onChange={(value) => setData("category", value)}
                            options={[
                                { value: "adult", label: "Dewasa" },
                                { value: "child", label: "Anak" },
                            ]}
                        />
                        {serverErrors.category && <p className="text-xs text-red-500 mt-1">{serverErrors.category}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label required={true}>Deskripsi</Label>
                        <RichTextEditor
                            value={data.description}
                            onChange={(value: string) => setData("description", value)}
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

                    {/* Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required={true}>Tanggal Mulai</Label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData("start_date", e.target.value)}
                            />
                            {serverErrors.start_date && <p className="text-xs text-red-500 mt-1">{serverErrors.start_date}</p>}
                        </div>
                        <div>
                            <Label required={true}>Tanggal Selesai</Label>
                            <Input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData("end_date", e.target.value)}
                            />
                            {serverErrors.end_date && <p className="text-xs text-red-500 mt-1">{serverErrors.end_date}</p>}
                        </div>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required={true}>Jam Mulai</Label>
                            <Input
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData("start_time", e.target.value)}
                            />
                            {serverErrors.start_time && <p className="text-xs text-red-500 mt-1">{serverErrors.start_time}</p>}
                        </div>
                        <div>
                            <Label required={true}>Jam Selesai</Label>
                            <Input
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData("end_time", e.target.value)}
                            />
                            {serverErrors.end_time && <p className="text-xs text-red-500 mt-1">{serverErrors.end_time}</p>}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label required={true}>Harga Online</Label>
                            <CurrencyInput
                                value={data.online_price}
                                onChange={(val) => setData("online_price", val)}
                            />
                            {serverErrors.online_price && <p className="text-xs text-red-500 mt-1">{serverErrors.online_price}</p>}
                        </div>
                        <div>
                            <Label required={true}>Harga Offline</Label>
                            <CurrencyInput
                                value={data.offline_price}
                                onChange={(val) => setData("offline_price", val)}
                            />
                            {serverErrors.offline_price && <p className="text-xs text-red-500 mt-1">{serverErrors.offline_price}</p>}
                        </div>
                    </div>

                    {/* Requirement */}
                    <div>
                        <Label required={true}>Syarat</Label>
                        <MultiSelect
                            label=""
                            options={optionRequirement}
                            value={Array.isArray(data.requirement) ? data.requirement : []}
                            onChange={(selected: string[]) => setData("requirement", selected)}
                        />
                        {serverErrors.requirement && <p className="text-xs text-red-500 mt-1">{serverErrors.requirement}</p>}
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
