import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { FormEventHandler } from 'react';

import { Modal } from "@/Components/ui/modal";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import Label from "@/Components/form/Label";

import { AiOutlineLoading3Quarters, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import ImageUser from "../../../../../assets/images/image-user.png";
import { toast } from "react-toastify";

interface ModalUserProps {
    isOpen: boolean;
    onClose: () => void;
}

type UserForm = {
    name: string;
    phone: string;
    email: string;
    gender: string;
    avatar: File | null;
    role: string;
    password: string;
};

export const ModalUser = ({ isOpen, onClose }: ModalUserProps) => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(ImageUser);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const { data, setData, reset, errors } = useForm<UserForm>({
        name: "",
        phone: "",
        email: "",
        gender: "",
        avatar: null,
        role: "",
        password: "",
    });

    useEffect(() => {
        if (!isOpen) {
            reset();
            setImageFile(null);
            setImagePreview(ImageUser);
        }
        setServerErrors({});
    }, [isOpen, reset]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        setLoading(true);

        const formData = new FormData();
        formData.append("_method", "PATCH");
        Object.entries(data).forEach(([key, value]) => {
            if (key === "avatar" && value instanceof File) {
                formData.append(key, value);
            } else if (value !== null && value !== undefined) {
                formData.append(key, value as string);
            }
        });

        router.post(route("profile.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Pengguna berhasil ditambahkan");
                reset();
                setLoading(false);
                onClose();
            },
            onError: (errors) => {
                setServerErrors(errors);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[800px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">Tambah Pengguna</h4>

                <form className="flex flex-col" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        {/* Profile */}
                        <div>
                            <Label required={true}>Foto Profil</Label>
                            <input
                                name="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setData("avatar", file);
                                        setImageFile(file);
                                        setImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                            />
                            {serverErrors.avatar && <p className="mt-1 text-xs text-red-500">{serverErrors.avatar}</p>}
                        </div>

                        {/* Name */}
                        <div>
                            <Label required={true}>Nama Lengkap</Label>
                            <Input
                                name="name"
                                value={data.name}
                                placeholder="Masukkan Nama Lengkap"
                                onChange={(e) => setData("name", e.target.value)} />
                            {serverErrors.name && <p className="mt-1 text-xs text-red-500">{serverErrors.name}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <Label required={true}>No Hp</Label>
                            <Input
                                name="phone"
                                value={data.phone}
                                placeholder="Masukkan No Hp"
                                onChange={(e) => setData("phone", e.target.value)} />
                            {serverErrors.phone && <p className="mt-1 text-xs text-red-500">{serverErrors.phone}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                            <Label required={true}>Jenis Kelamin</Label>
                            <Select
                                value={data.gender}
                                onChange={(value) => setData("gender", value)}
                                options={[
                                    { value: "Laki-laki", label: "Laki-laki" },
                                    { value: "Perempuan", label: "Perempuan" },
                                ]}
                                placeholder="Pilih jenis kelamin"
                                className="w-full"
                            />
                            {serverErrors.gender && <p className="mt-1 text-xs text-error-500">{serverErrors.gender}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <Label required={true}>Email</Label>
                            <Input
                                name="email"
                                value={data.email}
                                placeholder="Masukkan Email"
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {serverErrors.email && <p className="text-sm text-red-500">{serverErrors.email}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <Label required={true}>Role</Label>
                            <Select
                                value={data.role}
                                onChange={(value) => setData("role", value)}
                                options={[
                                    { value: "admin", label: "Admin" },
                                    { value: "volunteer", label: "Volunteer" },
                                    { value: "visitor", label: "Visitor" },
                                ]}
                            />
                            {serverErrors.role && <p className="text-xs text-red-500 mt-1">{serverErrors.role}</p>}
                        </div>

                        {/* New Password */}
                        <div>
                            <Label required={true}>Kata Sandi</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="Masukkan Kata Sandi"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(showPassword => !showPassword)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </button>
                            </div>
                            {serverErrors.password && (
                                <p className="mt-1 text-xs text-red-500">{serverErrors.password}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6 justify-end">
                        <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button size="sm" type="submit" variant="default" disabled={loading}>
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin text-lg" />
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
}
