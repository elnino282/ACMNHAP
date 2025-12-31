import { Plus, Download, Bell, DollarSign, FileText, BarChart3 } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useExpenseManagement } from "./hooks/useExpenseManagement";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseTable } from "./components/ExpenseTable";
import { ExpenseAnalytics } from "./components/ExpenseAnalytics";
import { BudgetTracker } from "./components/BudgetTracker";
import { UpcomingPayables } from "./components/UpcomingPayables";
import { AIOptimizationTips } from "./components/AIOptimizationTips";
import { ExpenseFormModal } from "./components/ExpenseFormModal";

export function ExpenseManagement() {
    const {
        activeTab,
        setActiveTab,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        selectedExpense,
        searchQuery,
        setSearchQuery,
        selectedSeason,
        setSelectedSeason,
        selectedCategory,
        setSelectedCategory,
        selectedStatus,
        setSelectedStatus,
        seasonOptions,
        expenses,
        filteredExpenses,
        formData,
        setFormData,
        totalExpenses,
        budgetUsagePercentage,
        remainingBudget,
        paidExpenses,
        unpaidExpenses,
        handleAddExpense,
        handleEditExpense,
        handleDeleteExpense,
        resetForm,
        handleOpenAddExpense,
        isLoading,
        error,
    } = useExpenseManagement();

    return (
        <div className="min-h-screen bg-[#F8F8F4]">
            <div className="max-w-[1920px] mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    {/* Main Content Area */}
                    <div className="space-y-6">
                        {/* Header */}
                        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                            <CardHeader>
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3BA55D] to-[#2D8A4A] flex items-center justify-center shadow-sm">
                                            <DollarSign className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-[#333333]">
                                                Expense Management
                                            </CardTitle>
                                            <CardDescription className="text-sm text-[#777777]">
                                                Track and manage all farm expenses
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="outline"
                                            className="border-[#E0E0E0] rounded-xl hover:bg-[#F8F8F4]"
                                        >
                                            <Bell className="w-4 h-4 mr-2" />
                                            Reminders
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-[#E0E0E0] rounded-xl hover:bg-[#F8F8F4]"
                                            onClick={() => {
                                                toast.success("Exporting Data", {
                                                    description: "Your expense report will download shortly.",
                                                });
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                        <Button
                                            onClick={handleOpenAddExpense}
                                            className="bg-[#3BA55D] hover:bg-[#3BA55D]/90 text-white rounded-xl shadow-sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Expense
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="my-4 bg-[#E0E0E0]" />

                                {/* Filters Toolbar */}
                                <ExpenseFilters
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    selectedSeason={selectedSeason}
                                    setSelectedSeason={setSelectedSeason}
                                    seasonOptions={seasonOptions}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    selectedStatus={selectedStatus}
                                    setSelectedStatus={setSelectedStatus}
                                />
                            </CardHeader>
                        </Card>

                        {/* Tabbed Content */}
                        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F8F8F4] p-1 rounded-xl">
                                        <TabsTrigger
                                            value="list"
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            List View
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="analytics"
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Analytics View
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* List View */}
                                    <TabsContent value="list" className="space-y-4">
                                        {error && (
                                            <div className="rounded-xl border border-[#E0E0E0] bg-white p-4 text-sm text-[#E74C3C]">
                                                Failed to load expenses: {error.message}
                                            </div>
                                        )}
                                        {!error && selectedSeason === "all" && !isLoading && (
                                            <div className="rounded-xl border border-[#E0E0E0] bg-white p-6 text-sm text-[#777777]">
                                                Select a season to view expenses.
                                            </div>
                                        )}
                                        {isLoading ? (
                                            <div className="rounded-xl border border-[#E0E0E0] bg-white p-6 text-sm text-[#777777]">
                                                Loading expenses...
                                            </div>
                                        ) : (
                                        <ExpenseTable
                                            filteredExpenses={filteredExpenses}
                                            totalExpenses={expenses.length}
                                            handleEditExpense={handleEditExpense}
                                            handleDeleteExpense={handleDeleteExpense}
                                        />
                                        )}
                                    </TabsContent>

                                    {/* Analytics View */}
                                    <TabsContent value="analytics" className="space-y-6">
                                        <ExpenseAnalytics />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <BudgetTracker
                            totalExpenses={totalExpenses}
                            budgetUsagePercentage={budgetUsagePercentage}
                            remainingBudget={remainingBudget}
                            paidExpenses={paidExpenses}
                            unpaidExpenses={unpaidExpenses}
                        />
                        <UpcomingPayables />
                        <AIOptimizationTips />
                    </div>
                </div>
            </div>

            {/* Add/Edit Expense Modal */}
            <ExpenseFormModal
                isOpen={isAddExpenseOpen}
                setIsOpen={setIsAddExpenseOpen}
                selectedExpense={selectedExpense}
                formData={formData}
                setFormData={setFormData}
                handleAddExpense={handleAddExpense}
                resetForm={resetForm}
                seasonOptions={seasonOptions}
            />
        </div>
    );
}
