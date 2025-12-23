export type DocumentType = "pdf" | "image" | "video" | "spreadsheet" | "guide";

export interface Document {
    id: string;
    title: string;
    type: DocumentType;
    thumbnail: string;
    tags: string[];
    crop?: string;
    stage?: string;
    topic: string;
    season?: string;
    updatedAt: string;
    isFavorite: boolean;
    description: string;
    fileSize: string;
    author: string;
    relatedDocs?: string[];
}

export interface Filters {
    crops: string[];
    stages: string[];
    topics: string[];
    types: string[];
    seasons: string[];
}
