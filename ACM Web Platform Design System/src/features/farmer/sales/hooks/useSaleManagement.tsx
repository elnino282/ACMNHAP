import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
    CheckCircle2,
    XCircle,
    Clock,
    ShoppingBag,
    FileText,
    Truck,
    AlertTriangle,
    FileSignature,
    ArrowUpRight,
} from "lucide-react";
import { useFarmerSales, useCreateSale, useDeleteSale, type Sale as ApiSale, type SaleCreateRequest } from "@/entities/sale";
import type {
    Listing,
    Quote,
    Contract,
    Delivery,
    Payment,
    Dispute,
    SaleFormData,
    TabType,
    RecordType,
} from "../types";
import {
    MONTHLY_REVENUE_DATA,
    BUYER_MIX_DATA,
} from "../constants";
import { Badge } from "@/components/ui/badge";

/**
 * Transform API sale to Listing format
 */
const transformApiToListing = (sale: ApiSale): Listing => ({
    type: 'listing',
    id: String(sale.id),
    lotId: `LOT-${sale.harvestId ?? sale.id}`,
    crop: 'Harvest Product',
    grade: 'A',
    quantity: sale.quantity,
    pricePerKg: sale.unitPrice,
    status: sale.status === 'COMPLETED' ? 'sold' : sale.status === 'CANCELLED' ? 'expired' : 'active',
    season: 'Current Season',
    postedDate: sale.saleDate,
});

/**
 * Transform form data to API request
 */
const transformFormToApi = (formData: SaleFormData): SaleCreateRequest => ({
    harvestId: 1, // Would be selected from harvest dropdown
    saleDate: new Date().toISOString().split('T')[0],
    quantity: parseFloat(formData.quantity),
    unitPrice: parseFloat(formData.pricePerKg),
    notes: `${formData.lotId} - ${formData.crop} - Grade ${formData.grade}`,
});

export function useSaleManagement() {
    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const { data: apiSales, isLoading, error, refetch } = useFarmerSales();

    const createMutation = useCreateSale({
        onSuccess: () => {
            toast.success("Listing Created", {
                description: "Your sale listing has been created successfully",
            });
            setIsAddListingOpen(false);
            resetForm();
        },
        onError: (err) => {
            toast.error("Failed to Create Listing", {
                description: err.message || "Please try again",
            });
        },
    });

    const deleteMutation = useDeleteSale({
        onSuccess: () => {
            toast.success("Listing Deleted", {
                description: "The listing has been removed.",
            });
        },
        onError: (err) => {
            toast.error("Failed to Delete Listing", {
                description: err.message || "Please try again",
            });
        },
    });

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    const [selectedSeason, setSelectedSeason] = useState("all");
    const [activeTab, setActiveTab] = useState<TabType>("listings");
    const [isAddListingOpen, setIsAddListingOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);
    const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

    // Related data - will be separate API calls in full implementation
    const [quotes] = useState<Quote[]>([]);
    const [contracts] = useState<Contract[]>([]);
    const [deliveries] = useState<Delivery[]>([]);
    const [payments] = useState<Payment[]>([]);
    const [disputes] = useState<Dispute[]>([]);

    const [formData, setFormData] = useState<SaleFormData>({
        lotId: "",
        crop: "",
        grade: "A",
        quantity: "",
        pricePerKg: "",
        season: "",
    });

    // ═══════════════════════════════════════════════════════════════
    // TRANSFORMED DATA
    // ═══════════════════════════════════════════════════════════════

    const listings = useMemo(() => {
        if (apiSales?.items && apiSales.items.length > 0) {
            return apiSales.items.map(transformApiToListing);
        }
        return [];
    }, [apiSales]);

    // ═══════════════════════════════════════════════════════════════
    // COMPUTED KPIs
    // ═══════════════════════════════════════════════════════════════

    const totalRevenue = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0);

    const ordersCount = quotes.filter((q) => q.status === "accepted").length;

    const pendingDeliveries = deliveries.filter(
        (d) => d.status === "scheduled"
    ).length;

    const unpaidAmount = payments
        .filter((p) => p.status === "pending" || p.status === "overdue")
        .reduce((sum, p) => sum + p.amount, 0);

    const disputesOpen = disputes.filter((d) => d.status === "open").length;

    // ═══════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════

    const handleAddListing = useCallback(() => {
        if (!formData.lotId || !formData.crop || !formData.quantity || !formData.pricePerKg) {
            toast.error("Missing Required Fields", {
                description: "Please fill in all required fields marked with *",
            });
            return;
        }

        createMutation.mutate(transformFormToApi(formData));
    }, [formData, createMutation]);

    const handleDeleteListing = useCallback((id: string) => {
        const saleId = parseInt(id, 10);
        if (!isNaN(saleId)) {
            deleteMutation.mutate(saleId);
        }
    }, [deleteMutation]);

    const resetForm = useCallback(() => {
        setFormData({
            lotId: "",
            crop: "",
            grade: "A",
            quantity: "",
            pricePerKg: "",
            season: "",
        });
    }, []);

    const handleViewDetails = useCallback((record: any, type: string) => {
        setSelectedRecord({ ...record, type });
        setIsDetailsDrawerOpen(true);
    }, []);

    const getStatusBadge = (status: string, _type: string) => {
        const statusConfig: Record<
            string,
            { bg: string; text: string; border: string; icon: any }
        > = {
            active: { bg: "bg-[#3BA55D]/10", text: "text-[#3BA55D]", border: "border-[#3BA55D]/20", icon: CheckCircle2 },
            sold: { bg: "bg-[#4A90E2]/10", text: "text-[#4A90E2]", border: "border-[#4A90E2]/20", icon: ShoppingBag },
            expired: { bg: "bg-[#777777]/10", text: "text-[#777777]", border: "border-[#777777]/20", icon: Clock },
            pending: { bg: "bg-[#F4C542]/10", text: "text-[#333333]", border: "border-[#F4C542]/20", icon: Clock },
            accepted: { bg: "bg-[#3BA55D]/10", text: "text-[#3BA55D]", border: "border-[#3BA55D]/20", icon: CheckCircle2 },
            rejected: { bg: "bg-[#E74C3C]/10", text: "text-[#E74C3C]", border: "border-[#E74C3C]/20", icon: XCircle },
            countered: { bg: "bg-[#4A90E2]/10", text: "text-[#4A90E2]", border: "border-[#4A90E2]/20", icon: ArrowUpRight },
            draft: { bg: "bg-[#777777]/10", text: "text-[#777777]", border: "border-[#777777]/20", icon: FileText },
            signed: { bg: "bg-[#3BA55D]/10", text: "text-[#3BA55D]", border: "border-[#3BA55D]/20", icon: FileSignature },
            completed: { bg: "bg-[#4A90E2]/10", text: "text-[#4A90E2]", border: "border-[#4A90E2]/20", icon: CheckCircle2 },
            cancelled: { bg: "bg-[#E74C3C]/10", text: "text-[#E74C3C]", border: "border-[#E74C3C]/20", icon: XCircle },
            scheduled: { bg: "bg-[#F4C542]/10", text: "text-[#333333]", border: "border-[#F4C542]/20", icon: Clock },
            "in-transit": { bg: "bg-[#4A90E2]/10", text: "text-[#4A90E2]", border: "border-[#4A90E2]/20", icon: Truck },
            delivered: { bg: "bg-[#3BA55D]/10", text: "text-[#3BA55D]", border: "border-[#3BA55D]/20", icon: CheckCircle2 },
            paid: { bg: "bg-[#3BA55D]/10", text: "text-[#3BA55D]", border: "border-[#3BA55D]/20", icon: CheckCircle2 },
            overdue: { bg: "bg-[#E74C3C]/10", text: "text-[#E74C3C]", border: "border-[#E74C3C]/20", icon: AlertTriangle },
            open: { bg: "bg-[#E74C3C]/10", text: "text-[#E74C3C]", border: "border-[#E74C3C]/20", icon: AlertTriangle },
            "in-review": { bg: "bg-[#F4C542]/10", text: "text-[#333333]", border: "border-[#F4C542]/20", icon: Clock },
            resolved: { bg: "bg-[#3BA55D]/10", text: "text-[#3BA55D]", border: "border-[#3BA55D]/20", icon: CheckCircle2 },
            escalated: { bg: "bg-[#E74C3C]/10", text: "text-[#E74C3C]", border: "border-[#E74C3C]/20", icon: AlertTriangle },
        };

        const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.bg} ${config.text} ${config.border}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return {
        // State
        selectedSeason,
        setSelectedSeason,
        activeTab,
        setActiveTab,
        isAddListingOpen,
        setIsAddListingOpen,
        selectedRecord,
        isDetailsDrawerOpen,
        setIsDetailsDrawerOpen,
        listings,
        quotes,
        contracts,
        deliveries,
        payments,
        disputes,
        formData,
        setFormData,

        // Loading & Error
        isLoading,
        error: error ?? null,
        refetch,

        // KPIs
        totalRevenue,
        ordersCount,
        pendingDeliveries,
        unpaidAmount,
        disputesOpen,

        // Chart Data
        monthlyRevenue: MONTHLY_REVENUE_DATA,
        buyerMix: BUYER_MIX_DATA,

        // Handlers
        handleAddListing,
        handleDeleteListing,
        resetForm,
        handleViewDetails,
        getStatusBadge,

        // Mutation states
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

















