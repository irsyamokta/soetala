import Button from "@/Components/ui/button/Button";
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import useTranslate from "@/hooks/useTranslate";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LogoColor from "../../../assets/logo/logo-color.png";

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const t = useTranslate();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-gray-100 mx-4 sm:justify-center sm:pt-0">
            <div className="w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                <Head title="Verifikasi Email" />

                <div className="flex flex-col justify-center items-center gap-3">
                    <div>
                        <img src={LogoColor} alt="Forgot Password" className="w-72 h-auto" />
                    </div>
                    <p className="mb-4 text-sm text-center text-gray-600">
                        {t("emailverify.description")}
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {t("emailverify.status")}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mt-4 flex justify-center">
                        <Button type="submit" variant="default" disabled={processing} className="w-full">
                            {processing ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                    Loading...
                                </>
                            ) : (
                                t("emailverify.button")
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
