import { Head } from '@inertiajs/react';
import ImageNotFound from "../../../assets/images/image-404.png";

type Props = {
    status: number;
    message: string;
};

export default function NotFound({ status, message }: Props) {
    return (
        <>
            <Head title="Not Found" />

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <img src={ImageNotFound} alt="" className="w-72 h-auto" />
                <p className="mt-4 text-xl font-semibold">Oppps! Page {message}</p>
            </div>
        </>
    );
}
