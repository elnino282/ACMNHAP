import { Plus, Download, Printer, ShoppingBag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSaleManagement } from "./hooks/useSaleManagement";
import { SEASON_OPTIONS } from "./constants";
import { KPICards } from "./components/KPICards";
import { SalesTabs } from "./components/SalesTabs";
import { ChartsSection } from "./components/ChartsSection";
import { QuickActionsPanel } from "./components/QuickActionsPanel";
import { SalesSummaryCard } from "./components/SalesSummaryCard";
import { AddListingDialog } from "./components/AddListingDialog";
import { DetailsDrawer } from "./components/DetailsDrawer";

export function SaleManagement() {
    const {
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
        totalRevenue,
        ordersCount,
        pendingDeliveries,
        unpaidAmount,
        disputesOpen,
        monthlyRevenue,
        buyerMix,
        handleAddListing,
        handleDeleteListing,
        resetForm,
        handleViewDetails,
        getStatusBadge,
    } = useSaleManagement();

    const handleOpenAddListing = () => {
        resetForm();
        setIsAddListingOpen(true);
    };

    const handleCancelDialog = () => {
        setIsAddListingOpen(false);
        resetForm();
    };

    return (
        <div className="min-h-screen bg-[#F8F8F4]">
            <div className="max-w-[1920px] mx-auto p-6">
                {/* Header */}
                <Card className="border-[#E0E0E0] rounded-2xl shadow-sm mb-6">
                    <CardHeader>
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3BA55D] to-[#2F9E44] flex items-center justify-center shadow-sm">
                                    <ShoppingBag className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-[#333333]">
                                        Sale Management
                                    </CardTitle>
                                    <CardDescription className="text-sm text-[#777777]">
                                        Manage listings, orders, contracts, deliveries, and payments
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                                    <SelectTrigger className="w-[200px] rounded-xl border-[#E0E0E0]">
                                        <SelectValue placeholder="All Seasons" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SEASON_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleOpenAddListing}
                                    className="bg-[#3BA55D] hover:bg-[#3BA55D]/90 text-white rounded-xl shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Listing
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* KPI Cards */}
                <KPICards
                    totalRevenue={totalRevenue}
                    ordersCount={ordersCount}
                    pendingDeliveries={pendingDeliveries}
                    unpaidAmount={unpaidAmount}
                    disputesOpen={disputesOpen}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    <div className="space-y-6">
                        {/* Tabs */}
                        <SalesTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            listings={listings}
                            quotes={quotes}
                            contracts={contracts}
                            deliveries={deliveries}
                            payments={payments}
                            disputes={disputes}
                            onViewDetails={handleViewDetails}
                            onDeleteListing={handleDeleteListing}
                            getStatusBadge={getStatusBadge}
                        />

                        {/* Charts */}
                        <ChartsSection monthlyRevenue={monthlyRevenue} buyerMix={buyerMix} />

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                variant="outline"
                                className="rounded-xl border-[#E0E0E0]"
                                onClick={() => {
                                    toast.success("Exporting to CSV", {
                                        description: "Your sales data will download shortly.",
                                    });
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl border-[#E0E0E0]"
                                onClick={() => {
                                    toast.success("Printing Summary", {
                                        description: "Preparing your sales summary...",
                                    });
                                }}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Summary
                            </Button>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-4">
                        <QuickActionsPanel />
                        <SalesSummaryCard
                            listings={listings}
                            quotes={quotes}
                            contracts={contracts}
                        />
                    </div>
                </div>
            </div>

            {/* Modals & Drawers */}
            <AddListingDialog
                open={isAddListingOpen}
                onOpenChange={setIsAddListingOpen}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleAddListing}
                onCancel={handleCancelDialog}
            />

            <DetailsDrawer
                open={isDetailsDrawerOpen}
                onOpenChange={setIsDetailsDrawerOpen}
                record={selectedRecord}
            />
        </div>
    );
}





























