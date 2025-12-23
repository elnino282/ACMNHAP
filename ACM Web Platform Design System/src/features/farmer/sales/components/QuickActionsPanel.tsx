import { FileSignature, Wallet, Truck, Download, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function QuickActionsPanel() {
    return (
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#333333]">
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-[#E0E0E0] hover:bg-[#F8F8F4]"
                    onClick={() => {
                        toast.info("Generate Contract", {
                            description: "Opening contract generation wizard...",
                        });
                    }}
                >
                    <FileSignature className="w-4 h-4 mr-2 text-[#4A90E2]" />
                    Generate Contract
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-[#E0E0E0] hover:bg-[#F8F8F4]"
                    onClick={() => {
                        toast.success("Confirm Payment", {
                            description: "Payment confirmation recorded.",
                        });
                    }}
                >
                    <Wallet className="w-4 h-4 mr-2 text-[#3BA55D]" />
                    Confirm Payment
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-[#E0E0E0] hover:bg-[#F8F8F4]"
                    onClick={() => {
                        toast.info("Schedule Delivery", {
                            description: "Opening delivery scheduling form...",
                        });
                    }}
                >
                    <Truck className="w-4 h-4 mr-2 text-[#F4C542]" />
                    Schedule Delivery
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-[#E0E0E0] hover:bg-[#F8F8F4]"
                    onClick={() => {
                        toast.success("Export Invoice", {
                            description: "Generating invoice PDF...",
                        });
                    }}
                >
                    <Download className="w-4 h-4 mr-2 text-[#777777]" />
                    Export Invoice
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-[#E0E0E0] hover:bg-[#F8F8F4]"
                    onClick={() => {
                        toast.info("Open Dispute", {
                            description: "Opening dispute submission form...",
                        });
                    }}
                >
                    <AlertTriangle className="w-4 h-4 mr-2 text-[#E74C3C]" />
                    Open Dispute
                </Button>
            </CardContent>
        </Card>
    );
}





























