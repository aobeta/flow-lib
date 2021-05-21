export interface MoonNftData {
    id?: number;
    mediaUrl: string;
    creator: string;
    creatorProfile: string;
    metadata: Record<string,string>;
}

export interface MoonNftPackData {
    id? : number;
    previewMediaUrl: string;
    collectionNftIds: number;
    creator: string;
    creatorProfile: string;
}
