import { Head } from '@inertiajs/react';
import ImageForbidden from "../../../assets/images/image-403.png";

type Props = {
    status: number;
    message: string;
};

export default function Forbidden({ status, message }: Props) {
    return (
        <>
            <Head title="Forbidden" />

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <img src={ImageForbidden} alt="" className="w-72 h-auto" />
                <p className="mt-4 text-xl font-semibold">Oppps! Access {message}</p>
            </div>
        </>
    );
}
