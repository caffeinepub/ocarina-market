import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface BrandingAsset {
    contentType: string;
    blob: ExternalBlob;
    mediaKind: MediaKind;
}
export type MediaKind = {
    __kind__: "image";
    image: null;
} | {
    __kind__: "model3d";
    model3d: {
        modelType: string;
    };
};
export interface BulkItemInput {
    title: string;
    contentType: string;
    description?: string;
    category: ItemCategory;
    shapeCategory: string;
    photo: ExternalBlob;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Item {
    id: Uint8Array;
    title: string;
    contentType: string;
    published: boolean;
    createdBy: Principal;
    sold: boolean;
    description: string;
    category: ItemCategory;
    shapeCategory: string;
    photo: ExternalBlob;
    priceInCents: bigint;
}
export type StorefrontHeroText = {
    __kind__: "custom";
    custom: {
        title: string;
        subtitle: string;
    };
} | {
    __kind__: "default";
    default: null;
};
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StorefrontItems {
    headerAsset: BrandingAsset;
    heroText: StorefrontHeroText;
    items: Array<Item>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Branding {
    appName: string;
    logo: ExternalBlob;
    storefrontHeroText: StorefrontHeroText;
    heroMedia: BrandingAsset;
}
export interface UserProfile {
    name: string;
}
export enum ItemCategory {
    ceramic = "ceramic",
    printed = "printed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addShapeCategory(category: string): Promise<void>;
    addToBasket(itemId: Uint8Array): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUploadItems(itemsInput: Array<BulkItemInput>): Promise<Array<Uint8Array>>;
    clearBasket(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCheckoutSessionFromBasket(successUrl: string, cancelUrl: string): Promise<string>;
    getBasket(): Promise<{
        items: Array<Item>;
        itemIds: Array<Uint8Array>;
    }>;
    getBranding(): Promise<Branding | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: Uint8Array): Promise<Item>;
    getItems(): Promise<Array<Item>>;
    getItemsByCategory(category: ItemCategory): Promise<Array<Item>>;
    getShapeCategories(): Promise<Array<string>>;
    getStorefrontHeroText(): Promise<StorefrontHeroText>;
    getStorefrontItems(): Promise<StorefrontItems | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markItemsAsSold(itemIds: Array<Uint8Array>): Promise<void>;
    publishItems(itemIds: Array<Uint8Array>): Promise<void>;
    removeFromBasket(itemId: Uint8Array): Promise<void>;
    renameShapeCategory(oldName: string, newName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBranding(brand: Branding): Promise<void>;
    setItemPrice(itemId: Uint8Array, priceInCents: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unpublishItems(itemIds: Array<Uint8Array>): Promise<void>;
    updateAllItemPricesByCategory(): Promise<void>;
    updateAllPrintedItemDescriptions(newDescription: string): Promise<void>;
    updateItemDescription(itemId: Uint8Array, newDescription: string): Promise<void>;
    updateItemPhoto(itemId: Uint8Array, newPhoto: ExternalBlob, newContentType: string): Promise<void>;
}
