import useTranslate from "@/hooks/useTranslate";
import ImageEmpty from "../../../../../assets/images/image-empty.png";

export const EmptyTransaction = () => {

    const t = useTranslate();

    return (
        <div className="space-y-6 mt-4">
            <div className="border rounded-2xl p-6 bg-white" >
                <div className="flex flex-col justify-center items-center mb-4">
                    <img src={ImageEmpty} alt="" className="w-48" />
                    <p className="text-gray-500 text-sm">{t("transaction.empty")}</p>
                </div>
            </div>
        </div>
    );
};
