import { useState } from "react";
import { useForm } from "@inertiajs/react";
import useTranslate from "@/hooks/useTranslate";
import { AiOutlineLoading3Quarters, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { LuTrash2 } from "react-icons/lu";
import { Modal } from "@/Components/ui/modal";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import Label from "@/Components/form/Label";

export default function DeleteProfile() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const t = useTranslate();

    const { data, setData, delete: destroy, reset, errors } = useForm({
        password: "",
    });

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsOpen(false);
                setLoading(false);
            },
            onError: () => setLoading(false),
            onFinish: () => setLoading(false),
        });
    };

    return (
        <>
            {/* Card Delete Account */}
            <div className="p-5 border border-red-200 rounded-2xl dark:border-red-800 lg:p-6 bg-red-50/40 dark:bg-red-900/20">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h4 className="mb-1 text-lg font-semibold text-red-700 dark:text-red-400">
                            {t("profile.deleteaccount")}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("deleteaccount.description")}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-100 hover:text-red-800 dark:border-red-700 dark:bg-red-800/40 dark:text-red-300 dark:hover:bg-red-800/60 lg:inline-flex lg:w-auto"
                    >
                        <LuTrash2 className="w-4 h-4" />
                        {t("deleteaccount.button")}
                    </button>
                </div>
            </div>

            {/* Modal Delete Account */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[500px] m-4">
                <div className="relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
                    <h4 className="mb-4 text-2xl font-semibold text-red-700 dark:text-red-400">
                        {t("profile.deleteaccount")}
                    </h4>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {t("deleteaccount.warning")}
                    </p>

                    <form
                        className="flex flex-col space-y-5"
                        onSubmit={handleDelete}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                                e.preventDefault();
                            }
                        }}
                    >
                        {/* Password Confirm */}
                        <div>
                            <Label>{t("password-label")}</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder={t("password-placeholder")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                                {t("cancel")}
                            </Button>
                            <Button size="sm" type="submit" variant="danger" disabled={loading}>
                                {loading ? (
                                    <>
                                        <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                        {t("loading")}
                                    </>
                                ) : (
                                    t("delete")
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
