import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabType, Listing, Quote, Contract, Delivery, Payment, Dispute } from "../types";
import { ListingsTable } from "./ListingsTable";
import { QuotesTable } from "./QuotesTable";
import { ContractsTable } from "./ContractsTable";
import { DeliveriesTable } from "./DeliveriesTable";
import { PaymentsTable } from "./PaymentsTable";
import { DisputesTable } from "./DisputesTable";

interface SalesTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    listings: Listing[];
    quotes: Quote[];
    contracts: Contract[];
    deliveries: Delivery[];
    payments: Payment[];
    disputes: Dispute[];
    onViewDetails: (record: any, type: string) => void;
    onDeleteListing: (id: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function SalesTabs({
    activeTab,
    onTabChange,
    listings,
    quotes,
    contracts,
    deliveries,
    payments,
    disputes,
    onViewDetails,
    onDeleteListing,
    getStatusBadge,
}: SalesTabsProps) {
    return (
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
            <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6 bg-[#F8F8F4]">
                        <TabsTrigger value="listings" className="text-xs md:text-sm">
                            Listings
                        </TabsTrigger>
                        <TabsTrigger value="quotes" className="text-xs md:text-sm">
                            Quotes/Orders
                        </TabsTrigger>
                        <TabsTrigger value="contracts" className="text-xs md:text-sm">
                            Contracts
                        </TabsTrigger>
                        <TabsTrigger value="deliveries" className="text-xs md:text-sm">
                            Deliveries
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="text-xs md:text-sm">
                            Payments
                        </TabsTrigger>
                        <TabsTrigger value="disputes" className="text-xs md:text-sm">
                            Disputes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="listings" className="mt-0">
                        <ListingsTable
                            listings={listings}
                            onViewDetails={onViewDetails}
                            onDelete={onDeleteListing}
                            getStatusBadge={getStatusBadge}
                        />
                    </TabsContent>

                    <TabsContent value="quotes" className="mt-0">
                        <QuotesTable
                            quotes={quotes}
                            onViewDetails={onViewDetails}
                            getStatusBadge={getStatusBadge}
                        />
                    </TabsContent>

                    <TabsContent value="contracts" className="mt-0">
                        <ContractsTable
                            contracts={contracts}
                            onViewDetails={onViewDetails}
                            getStatusBadge={getStatusBadge}
                        />
                    </TabsContent>

                    <TabsContent value="deliveries" className="mt-0">
                        <DeliveriesTable
                            deliveries={deliveries}
                            onViewDetails={onViewDetails}
                            getStatusBadge={getStatusBadge}
                        />
                    </TabsContent>

                    <TabsContent value="payments" className="mt-0">
                        <PaymentsTable
                            payments={payments}
                            onViewDetails={onViewDetails}
                            getStatusBadge={getStatusBadge}
                        />
                    </TabsContent>

                    <TabsContent value="disputes" className="mt-0">
                        <DisputesTable
                            disputes={disputes}
                            onViewDetails={onViewDetails}
                            getStatusBadge={getStatusBadge}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}





























