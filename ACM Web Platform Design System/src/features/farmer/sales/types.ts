export interface Listing {
    type: 'listing';
    id: string;
    lotId: string;
    crop: string;
    grade: "A" | "B" | "C" | "Premium";
    quantity: number;
    pricePerKg: number;
    status: "active" | "sold" | "expired";
    season: string;
    postedDate: string;
}

export interface Quote {
    type: 'quote';
    id: string;
    orderId: string;
    buyer: string;
    buyerCompany: string;
    offerPrice: number;
    quantity: number;
    status: "pending" | "accepted" | "rejected" | "countered";
    lotId: string;
    crop: string;
    requestDate: string;
}

export interface Contract {
    type: 'contract';
    id: string;
    contractNo: string;
    buyer: string;
    value: number;
    signedDate: string;
    deliveryDate: string;
    status: "draft" | "signed" | "active" | "completed" | "cancelled";
    crop: string;
    quantity: number;
}

export interface Delivery {
    type: 'delivery';
    id: string;
    deliveryId: string;
    pickupDate: string;
    carrier: string;
    status: "scheduled" | "in-transit" | "delivered" | "cancelled";
    contractNo: string;
    buyer: string;
    proofOfDelivery?: string;
}

export interface Payment {
    type: 'payment';
    id: string;
    invoiceNo: string;
    amount: number;
    status: "pending" | "paid" | "overdue" | "cancelled";
    dueDate: string;
    paidDate?: string;
    buyer: string;
    contractNo: string;
}

export interface Dispute {
    type: 'dispute';
    id: string;
    disputeId: string;
    buyer: string;
    issueType: "quality" | "quantity" | "delivery" | "payment" | "other";
    status: "open" | "in-review" | "resolved" | "escalated";
    openedDate: string;
    description: string;
    contractNo: string;
}

export interface SaleFormData {
    lotId: string;
    crop: string;
    grade: "A" | "B" | "C" | "Premium";
    quantity: string;
    pricePerKg: string;
    season: string;
}

export type TabType = "listings" | "quotes" | "contracts" | "deliveries" | "payments" | "disputes";

export type RecordType = Listing | Quote | Contract | Delivery | Payment | Dispute;

export interface ChartDataPoint {
    month: string;
    revenue: number;
}

export interface BuyerMixDataPoint {
    name: string;
    value: number;
    color: string;
}





























