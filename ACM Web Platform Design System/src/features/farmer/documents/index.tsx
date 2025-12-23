import { Search, Filter } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from "./hooks/useDocuments";
import { DocumentFilters } from "./components/DocumentFilters";
import { DocumentGrid } from "./components/DocumentGrid";
import { EmptyState } from "./components/EmptyState";
import { DocumentPreview } from "./components/DocumentPreview";

export function Documents() {
    const {
        searchQuery,
        activeTab,
        selectedDoc,
        isPreviewOpen,
        isFilterOpen,
        hoveredDocId,
        filters,
        filteredDocuments,
        activeFilterCount,
        isLoading,
        isEmpty,
        setSearchQuery,
        setActiveTab,
        setIsPreviewOpen,
        setIsFilterOpen,
        setHoveredDocId,
        setSelectedDoc,
        handleToggleFavorite,
        handleDownload,
        handlePreview,
        handleFilterChange,
        clearAllFilters,
        getDocumentIcon,
        getRelatedDocuments,
    } = useDocuments();

    return (
        <div className="min-h-screen bg-[#F5F3EE]">
            <div className="max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
                    {/* Left Sidebar - Filters */}
                    <DocumentFilters
                        filters={filters}
                        activeFilterCount={activeFilterCount}
                        isFilterOpen={isFilterOpen}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearAllFilters}
                    />

                    {/* Main Content */}
                    <main className="p-6">
                        {/* Top Bar */}
                        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm mb-6">
                            <CardHeader>
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-2xl text-[#333333] flex items-center gap-2">
                                            📘 Documents
                                        </CardTitle>
                                        <CardDescription className="text-sm text-[#777777]">
                                            Access farming guides, tutorials, and resources
                                        </CardDescription>
                                    </div>

                                    <div className="flex items-center gap-3 flex-1 lg:flex-initial lg:min-w-[400px]">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#777777]" />
                                            <Input
                                                placeholder="Search documents..."
                                                value={searchQuery}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                                className="pl-10 rounded-xl border-[#E0E0E0] focus:border-[#4CAF50]"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="lg:hidden rounded-xl border-[#4CAF50] text-[#4CAF50]"
                                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        >
                                            <Filter className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Tabs and Content */}
                        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="w-full md:w-auto grid grid-cols-3 mb-6 bg-[#F5F5F5] rounded-xl p-1">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4CAF50]"
                                        >
                                            All Documents
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="favorites"
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4CAF50]"
                                        >
                                            ⭐ Favorites
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="recent"
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4CAF50]"
                                        >
                                            🕐 Recent
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value={activeTab} className="mt-0">
                                        {isLoading ? (
                                            <div className="p-6 text-sm text-[#777777]">
                                                Loading documents...
                                            </div>
                                        ) : isEmpty || filteredDocuments.length === 0 ? (
                                            <EmptyState
                                                searchQuery={searchQuery}
                                                activeFilterCount={activeFilterCount}
                                                onClearAll={() => {
                                                    setSearchQuery("");
                                                    clearAllFilters();
                                                }}
                                            />
                                        ) : (
                                            <DocumentGrid
                                                documents={filteredDocuments}
                                                hoveredDocId={hoveredDocId}
                                                onHoverChange={setHoveredDocId}
                                                onPreview={handlePreview}
                                                onToggleFavorite={handleToggleFavorite}
                                                onDownload={handleDownload}
                                                getDocumentIcon={getDocumentIcon}
                                            />
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>

            {/* Preview Drawer */}
            <DocumentPreview
                document={selectedDoc}
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                onDownload={handleDownload}
                getDocumentIcon={getDocumentIcon}
                getRelatedDocuments={getRelatedDocuments}
                onSelectRelated={setSelectedDoc}
            />
        </div>
    );
}
