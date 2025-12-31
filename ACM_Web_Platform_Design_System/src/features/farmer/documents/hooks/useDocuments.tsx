import { useEffect, useMemo, useState } from "react";
import {
    FileText,
    Image as ImageIcon,
    Video,
    FileSpreadsheet,
    BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useDocumentsList, type Document as ApiDocument } from "@/entities/document";
import type { Document, Filters, DocumentType } from "../types";

const mapApiToDocument = (doc: ApiDocument): Document => ({
    id: String(doc.id),
    title: doc.title,
    type: "guide",
    thumbnail: "📄",
    tags: [],
    crop: undefined,
    stage: undefined,
    topic: "General",
    season: undefined,
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    description: doc.content ?? "",
    fileSize: "N/A",
    author: "System",
    relatedDocs: [],
});

export function useDocuments() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const { data: apiDocuments, isLoading, error } = useDocumentsList();

    const [filters, setFilters] = useState<Filters>({
        crops: [],
        stages: [],
        topics: [],
        types: [],
        seasons: [],
    });

    const handleToggleFavorite = (docId: string) => {
        setDocuments(
            documents.map((doc) =>
                doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
            )
        );
        const doc = documents.find((d) => d.id === docId);
        toast.success(
            doc?.isFavorite ? "Removed from Favorites" : "Added to Favorites"
        );
    };

    const handleDownload = (doc: Document) => {
        toast.success("Download Started", {
            description: `Downloading ${doc.title}...`,
        });
    };

    const handlePreview = (doc: Document) => {
        setSelectedDoc(doc);
        setIsPreviewOpen(true);
    };

    const handleFilterChange = (
        category: keyof Filters,
        value: string,
        checked: boolean
    ) => {
        setFilters({
            ...filters,
            [category]: checked
                ? [...filters[category], value]
                : filters[category].filter((v) => v !== value),
        });
    };

    const clearAllFilters = () => {
        setFilters({
            crops: [],
            stages: [],
            topics: [],
            types: [],
            seasons: [],
        });
        toast.info("Filters Cleared");
    };

    const getFilteredDocuments = () => {
        let filtered = documents;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (doc) =>
                    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.tags.some((tag) =>
                        tag.toLowerCase().includes(searchQuery.toLowerCase())
                    ) ||
                    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply filters
        if (filters.crops.length > 0) {
            filtered = filtered.filter((doc) =>
                doc.crop ? filters.crops.includes(doc.crop) : false
            );
        }
        if (filters.stages.length > 0) {
            filtered = filtered.filter((doc) =>
                doc.stage ? filters.stages.includes(doc.stage) : false
            );
        }
        if (filters.topics.length > 0) {
            filtered = filtered.filter((doc) => filters.topics.includes(doc.topic));
        }
        if (filters.types.length > 0) {
            filtered = filtered.filter((doc) => filters.types.includes(doc.type));
        }
        if (filters.seasons.length > 0) {
            filtered = filtered.filter((doc) =>
                doc.season ? filters.seasons.includes(doc.season) : false
            );
        }

        // Tab filter
        if (activeTab === "favorites") {
            filtered = filtered.filter((doc) => doc.isFavorite);
        } else if (activeTab === "recent") {
            filtered = filtered.sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }

        return filtered;
    };

    const filteredDocuments = getFilteredDocuments();

    const activeFilterCount =
        filters.crops.length +
        filters.stages.length +
        filters.topics.length +
        filters.types.length +
        filters.seasons.length;

    const getDocumentIcon = (type: DocumentType) => {
        switch (type) {
            case "pdf":
                return <FileText className="w-5 h-5 text-[#E53935]" />;
            case "image":
                return <ImageIcon className="w-5 h-5 text-[#2196F3]" />;
            case "video":
                return <Video className="w-5 h-5 text-[#9C27B0]" />;
            case "spreadsheet":
                return <FileSpreadsheet className="w-5 h-5 text-[#4CAF50]" />;
            case "guide":
                return <BookOpen className="w-5 h-5 text-[#FF9800]" />;
        }
    };

    const getRelatedDocuments = (doc: Document) => {
        if (!doc.relatedDocs) return [];
        return documents.filter((d) => doc.relatedDocs?.includes(d.id));
    };

    useEffect(() => {
        if (!apiDocuments) return;

        setDocuments((prev) => {
            const prevMap = new Map(prev.map((doc) => [doc.id, doc]));
            return apiDocuments.map((doc) => {
                const mapped = mapApiToDocument(doc);
                const existing = prevMap.get(mapped.id);
                return {
                    ...mapped,
                    isFavorite: existing?.isFavorite ?? mapped.isFavorite,
                };
            });
        });
    }, [apiDocuments]);

    useEffect(() => {
        if (error) {
            toast.error("Failed to load documents", {
                description: error.message,
            });
        }
    }, [error]);

    const isEmpty = useMemo(() => documents.length === 0 && !isLoading, [documents.length, isLoading]);

    return {
        // State
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

        // Setters
        setSearchQuery,
        setActiveTab,
        setIsPreviewOpen,
        setIsFilterOpen,
        setHoveredDocId,
        setSelectedDoc,

        // Handlers
        handleToggleFavorite,
        handleDownload,
        handlePreview,
        handleFilterChange,
        clearAllFilters,

        // Utilities
        getDocumentIcon,
        getRelatedDocuments,
    };
}
