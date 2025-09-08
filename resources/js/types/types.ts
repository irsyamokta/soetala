import { PageProps as InertiaPageProps } from "@inertiajs/core";

export interface User {
    id: string;
    name: string;
    role?: string;
}

export interface FlashData {
    success?: boolean;
    message?: string;
    data?: {
        buyer_name: string;
        category_name: string;
        quantity: number;
        used_at: string;
    };
}

export interface Visitor {
    id: number | string;
    buyer_name: string;
    category_name: string;
    used_at: string;
    quantity: number;
}

export type PageProps = InertiaPageProps & {
    stocks: any[];
    totalRevenue: number;
    ticketsSold: number;
    merchandiseSold: number;
    visitors: Visitor[];
    totalVisitors: number;
    auth: {
        user?: User;
    };
    today: string;
    flash?: FlashData;
};

export type Ticket = {
    id: number;
    ticket_id: string;
    category: string;
    price: number;
    description?: string;
};

export type MerchVariant = {
    id: number;
    color: string;
    size: string;
    stock: number;
};

export type Merch = {
    id: number;
    product_name: string;
    price: number;
    variants: MerchVariant[];
};

export type OrderItem = {
    id: number;
    type: "ticket" | "merch";
    price: number;
    quantity: number;
    name?: string;
    color?: string;
    size?: string;
    note?: string;
    variantKey?: string;
};

export type MerchModalData = {
    merch: Merch;
    color: string;
    size: string;
    note: string;
    quantity: number;
};
