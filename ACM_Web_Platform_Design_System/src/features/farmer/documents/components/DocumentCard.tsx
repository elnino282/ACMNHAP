import { Star, Download, Clock, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Document, DocumentType } from "../types";

interface DocumentCardProps {
    document: Document;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onPreview: (doc: Document) => void;
    onToggleFavorite: (docId: string) => void;
    onDownload: (doc: Document) => void;
    getDocumentIcon: (type: DocumentType) => JSX.Element;
}

export function DocumentCard({
    document,
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onPreview,
    onToggleFavorite,
    onDownload,
    getDocumentIcon,
}: DocumentCardProps) {
    return (
        <Card
            className="border-[#E0E0E0] rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={() => onPreview(document)}
        >
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-[#4CAF50]/10 to-[#2196F3]/10 flex items-center justify-center text-6xl relative">
                {document.thumbnail}

                {/* Hover Overlay with Preview Button */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-in fade-in duration-200">
                        <Button
                            size="lg"
                            className="bg-white text-[#4CAF50] hover:bg-white/90 rounded-xl"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onPreview(document);
                            }}
                        >
                            <Eye className="w-5 h-5 mr-2" />
                            Preview
                        </Button>
                    </div>
                )}
            </div>

            <CardContent className="pt-4">
                {/* Type Icon and Favorite */}
                <div className="flex items-start justify-between mb-2">
                    {getDocumentIcon(document.type)}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onToggleFavorite(document.id);
                        }}
                    >
                        <Star
                            className={`w-4 h-4 ${document.isFavorite
                                ? "fill-[#FFB300] text-[#FFB300]"
                                : "text-[#777777]"
                                }`}
                        />
                    </Button>
                </div>

                {/* Title */}
                <h4 className="text-sm text-[#333333] mb-2 line-clamp-2 min-h-[40px]">
                    {document.title}
                </h4>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
                    {document.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {document.tags.length > 2 && (
                        <Badge
                            variant="outline"
                            className="text-xs bg-[#E0E0E0] text-[#777777]"
                        >
                            +{document.tags.length - 2}
                        </Badge>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-[#777777]">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(document.updatedAt).toLocaleDateString()}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onDownload(document);
                        }}
                    >
                        <Download className="w-4 h-4 text-[#2196F3]" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
