import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import useTranslate from "@/hooks/useTranslate";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import Label from "@/Components/form/Label";
import LogoColor from "../../../assets/logo/logo-color.png";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const t = useTranslate();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-gray-100 mx-4 sm:justify-center sm:pt-0">
            <div className="w-full overflow-hidden bg-white px-6 py-6 shadow-md sm:max-w-md sm:rounded-lg">
                <Head title="Lupa Password" />

                <div className="flex flex-col justify-center items-center gap-3">
                    <div>
                        <img src={LogoColor} alt="Forgot Password" className="w-72 h-auto" />
                    </div>
                    <p className="mb-4 text-sm text-center text-gray-600">
                        {t("forgotpassword.description")}
                    </p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder={t("email-placeholder")}
                            onChange={(e) => setData("email", e.target.value)}
                            error={!!errors.email}
                            hint={errors.email}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="default"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing ? (
                            <>
                                <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                Loading...
                            </>
                        ) : (
                            t("forgotpassword.button")
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
