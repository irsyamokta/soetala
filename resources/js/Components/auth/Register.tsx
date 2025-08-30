import { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import capitalizeFirst from "@/utils/capitalize";
import { AiOutlineLoading3Quarters, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import "flatpickr/dist/flatpickr.min.css";
import Label from "@/Components/form/Label";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import Button from "@/Components/ui/button/Button";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        gender: "",
        password: "",
    });

    const t = useTranslate();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title={capitalizeFirst(t("register"))} />

            <div className="flex flex-col flex-1 min-h-screen">
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <h1 className="mb-8 font-bold text-center text-gray-900 text-3xl dark:text-white">
                        {capitalizeFirst(t("register"))}
                    </h1>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Nama Lengkap */}
                        <div>
                            <Label>{t("name-label")} <span className="text-error-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder={t("name-placeholder")}
                                onChange={(e) => setData("name", e.target.value)}
                                error={!!errors.name}
                            />
                            {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
                        </div>

                        {/* Email & No HP */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Email <span className="text-error-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder={t("email-placeholder")}
                                    onChange={(e) => setData("email", e.target.value)}
                                    error={!!errors.email}
                                />
                                {errors.email && <p className="mt-1 text-xs text-error-500">{errors.email}</p>}
                            </div>
                            <div>
                                <Label>{t("phone-label")} <span className="text-error-500">*</span></Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    placeholder={t("phone-placeholder")}
                                    onChange={(e) => setData("phone", e.target.value)}
                                    error={!!errors.phone}
                                />
                                {errors.phone && <p className="mt-1 text-xs text-error-500">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <Label>{t("gender-label")} <span className="text-error-500">*</span></Label>
                            <Select
                                value={data.gender}
                                onChange={(value) => setData("gender", value)}
                                options={[
                                    { value: "Laki-laki", label: t("male") },
                                    { value: "Perempuan", label: t("female") },
                                ]}
                                placeholder={t("gender-placeholder")}
                                className="w-full"
                            />
                            {errors.gender && <p className="mt-1 text-xs text-error-500">{errors.gender}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <Label>{t("password-label")} <span className="text-error-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    placeholder={t("password-placeholder")}
                                    onChange={(e) => setData("password", e.target.value)}
                                    error={!!errors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-error-500">{errors.password}</p>}
                        </div>

                        {/* Submit */}
                        <Button type="submit" variant="default" disabled={processing} className="w-full rounded-none">
                            {processing ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                    Loading...
                                </>
                            ) : (
                                t("register")
                            )}
                        </Button>

                        <div className="flex justify-center mt-4 gap-1 text-sm">
                            <p>{t("have-account")}</p>
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                {capitalizeFirst(t("login"))}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
