import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";

import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import TextArea from "@/Components/form/input/TextArea";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface useForm {
    thumbnail: File | null,
    title: string,
    description: string,
    author: string,
    visibility: boolean,
}

interface ModalDioramaProps {
    isOpen: boolean;
    onClose: () => void;
    diorama?: any | null;
}

export const ModalDiorama = ({ isOpen, onClose, diorama }: ModalDioramaProps) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const initialFormData = {
        thumbnail: null as File | null,
        title: "",
        description: "",
        author: "",
        visibility: true,
    };

    const { data, setData, reset } = useForm<useForm>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (diorama) {
                setData({
                    thumbnail: null,
                    title: diorama.title|| "",
                    description: diorama.description || "",
                    author: diorama.author || "",
                    visibility: diorama.visibility ?? true,
                });
                setImageFile(null);
            } else {
                reset();
                setImageFile(null);
            }
        } else {
            reset();
            setImageFile(null);
        }
    }, [isOpen, diorama, reset]);

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

        if (diorama) {
            formData.append('_method', 'PATCH');

            router.post(route("diorama.update", diorama.id), formData, {
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
            router.post(route("diorama.store"), formData, {
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
                <h4 className="text-2xl font-semibold mb-4">{diorama ? "Edit Diorama" : "Tambah Diorama"}</h4>
                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {/* Thumbnail */}
                    <div>
                        <Label>Thumbnail</Label>
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

                    {/* Title */}
                    <div>
                        <Label>Judul Lukisan</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="Masukkan judul lukisan"
                        />
                        {serverErrors.title && <p className="text-xs text-red-500 mt-1">{serverErrors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Deskripsi</Label>
                        <TextArea
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Masukkan deskripsi"
                            rows={4}
                            hint={serverErrors.description}
                            maxLength={265}
                        />
                    </div>

                    {/* Author */}
                    <div>
                        <Label>Nama Pelukis</Label>
                        <Input
                            value={data.author}
                            onChange={(e) => setData("author", e.target.value)}
                            placeholder="Masukkan nama pelukis"
                        />
                        {serverErrors.author && <p className="text-xs text-red-500 mt-1">{serverErrors.author}</p>}
                    </div>

                    {/* Visibility */}
                    <div>
                        <Label>Visibility</Label>
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
