import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import capitalizeFirst from "@/utils/capitalize";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Label from "@/Components/form/Label";
import Input from "@/Components/form/input/InputField";
import Button from "@/Components/ui/button/Button";

export default function Login({ status }: { status?: string }) {
    const [showPassword, setShowPassword] = useState(false);

    const t = useTranslate();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"), {
            onSuccess: () => {
                toast.success("Login berhasil 🚀");
            },
            onFinish: () => {
                reset("password");
            },
        });
    };

    return (
        <>

            <Head title={capitalizeFirst(t("login"))} />

            <div className="flex flex-col flex-1">
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 font-bold text-center text-gray-800 text-3xl dark:text-white/90 sm:text-title-md">
                                {capitalizeFirst(t("login"))}
                            </h1>
                            {status && (
                                <div className="text-sm font-medium text-green-600">{status}</div>
                            )}
                        </div>

                        {/* FORM */}
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label>
                                    Email <span className="text-error-500">*</span>
                                </Label>
                                <Input id="email" type="email" name="email" value={data.email}
                                    placeholder={t("email-placeholder")} onChange={(e) => setData("email", e.target.value)}
                                    error={!!errors.email}
                                    hint={errors.email}
                                />
                            </div>

                            <div>
                                <Label>
                                    {t("password-label")} <span className="text-error-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? "text" : "password"} name="password"
                                        value={data.password} placeholder={t("password-placeholder")} onChange={(e) =>
                                            setData("password", e.target.value)}
                                        error={!!errors.password}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showPassword ?
                                            <AiFillEyeInvisible /> :
                                            <AiFillEye />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-error-500">{errors.password}</p>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <Link href="/forgot-password"
                                    className="text-sm font-normal text-brand-900 hover:underline dark:text-white">
                                    {t("forgot-password")}
                                </Link>
                            </div>

                            <Button type="submit" variant="default" disabled={processing} className="w-full rounded-none">
                                {processing ? (
                                    <>
                                        <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                        Loading...
                                    </>
                                ) : (
                                    t("login")
                                )}
                            </Button>

                            <div className="flex justify-center mt-4 gap-1 text-sm">
                                <p>{t("dont-have-account")}</p>
                                <Link href="/register" className="text-primary font-bold hover:underline">
                                    <span>{capitalizeFirst(t("register"))}</span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    );
}
