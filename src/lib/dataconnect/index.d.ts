import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum Category {
  NATIONAL_ID = "NATIONAL_ID",
  DRIVING_LICENSE = "DRIVING_LICENSE",
  WALLET = "WALLET",
  KEYS = "KEYS",
  OTHER = "OTHER",
};

export enum ItemStatus {
  ACTIVE = "ACTIVE",
  CLAIMED = "CLAIMED",
  EXPIRED = "EXPIRED",
  RESOLVED = "RESOLVED",
};

export enum ItemType {
  FOUND = "FOUND",
  LOST = "LOST",
};

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
};



export interface CreateEscrowTransactionData {
  escrowTransaction_insert: EscrowTransaction_Key;
}

export interface CreateEscrowTransactionVariables {
  itemId: UUIDString;
  amount: number;
  platformFee?: number | null;
  momoRef: string;
}

export interface CreateFoundItemData {
  item_insert: Item_Key;
}

export interface CreateFoundItemVariables {
  category: Category;
  title: string;
  description?: string | null;
  publicBlurredUrl?: string | null;
  privateRawUrl?: string | null;
  district: string;
  sector: string;
  meetingPoint?: string | null;
  feeOrReward?: number | null;
  maskedDocNumber?: string | null;
  expiresAt: TimestampString;
}

export interface CreateHandoverSessionData {
  handoverSession_insert: HandoverSession_Key;
}

export interface CreateHandoverSessionVariables {
  itemId: UUIDString;
  qrToken: string;
}

export interface CreateLostItemData {
  item_insert: Item_Key;
}

export interface CreateLostItemVariables {
  category: Category;
  title: string;
  description?: string | null;
  district: string;
  sector: string;
  meetingPoint?: string | null;
  feeOrReward?: number | null;
  maskedDocNumber?: string | null;
  expiresAt: TimestampString;
}

export interface CreateVerificationData {
  verification_insert: Verification_Key;
}

export interface CreateVerificationVariables {
  itemId: UUIDString;
  secretPrompt?: string | null;
  secretAnswer?: string | null;
}

export interface EscrowTransaction_Key {
  id: UUIDString;
  __typename?: 'EscrowTransaction_Key';
}

export interface GetCurrentUserData {
  user?: {
    id: string;
    phone: string;
    fullName: string;
    role: Role;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key;
}

export interface GetCurrentUserVariables {
  id: string;
}

export interface GetItemData {
  item?: {
    id: UUIDString;
    type: ItemType;
    category: Category;
    title: string;
    description?: string | null;
    publicBlurredUrl?: string | null;
    district: string;
    sector: string;
    meetingPoint?: string | null;
    scheduledDate?: TimestampString | null;
    feeOrReward: number;
    maskedDocNumber?: string | null;
    status: ItemStatus;
    createdAt: TimestampString;
    expiresAt: TimestampString;
    claimedAt?: TimestampString | null;
    finder?: {
      id: string;
      phone: string;
      fullName: string;
    } & User_Key;
    claimer?: {
      id: string;
      phone: string;
      fullName: string;
    } & User_Key;
  } & Item_Key;
}

export interface GetItemVariables {
  id: UUIDString;
}

export interface GetMyFoundItemsData {
  items: ({
    id: UUIDString;
    type: ItemType;
    category: Category;
    title: string;
    status: ItemStatus;
    createdAt: TimestampString;
    feeOrReward: number;
  } & Item_Key)[];
}

export interface GetMyLostItemsData {
  items: ({
    id: UUIDString;
    type: ItemType;
    category: Category;
    title: string;
    status: ItemStatus;
    createdAt: TimestampString;
    feeOrReward: number;
  } & Item_Key)[];
}

export interface HandoverSession_Key {
  id: UUIDString;
  __typename?: 'HandoverSession_Key';
}

export interface Item_Key {
  id: UUIDString;
  __typename?: 'Item_Key';
}

export interface ListActiveItemsData {
  items: ({
    id: UUIDString;
    type: ItemType;
    category: Category;
    title: string;
    description?: string | null;
    publicBlurredUrl?: string | null;
    district: string;
    sector: string;
    meetingPoint?: string | null;
    feeOrReward: number;
    maskedDocNumber?: string | null;
    status: ItemStatus;
    createdAt: TimestampString;
    expiresAt: TimestampString;
  } & Item_Key)[];
}

export interface ListActiveItemsVariables {
  type?: ItemType | null;
  category?: Category | null;
  district?: string | null;
  limit?: number | null;
}

export interface SearchItemsData {
  items_search: ({
    id: UUIDString;
    type: ItemType;
    category: Category;
    title: string;
    description?: string | null;
    publicBlurredUrl?: string | null;
    district: string;
    sector: string;
    status: ItemStatus;
    createdAt: TimestampString;
  } & Item_Key)[];
}

export interface SearchItemsVariables {
  query: string;
}

export interface SmsNotification_Key {
  id: UUIDString;
  __typename?: 'SmsNotification_Key';
}

export interface UpdateItemStatusData {
  item_update?: Item_Key | null;
}

export interface UpdateItemStatusVariables {
  id: UUIDString;
  status: ItemStatus;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  phone: string;
  fullName: string;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

export interface Verification_Key {
  id: UUIDString;
  __typename?: 'Verification_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface CreateFoundItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFoundItemVariables): MutationRef<CreateFoundItemData, CreateFoundItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFoundItemVariables): MutationRef<CreateFoundItemData, CreateFoundItemVariables>;
  operationName: string;
}
export const createFoundItemRef: CreateFoundItemRef;

export function createFoundItem(vars: CreateFoundItemVariables): MutationPromise<CreateFoundItemData, CreateFoundItemVariables>;
export function createFoundItem(dc: DataConnect, vars: CreateFoundItemVariables): MutationPromise<CreateFoundItemData, CreateFoundItemVariables>;

interface CreateLostItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLostItemVariables): MutationRef<CreateLostItemData, CreateLostItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLostItemVariables): MutationRef<CreateLostItemData, CreateLostItemVariables>;
  operationName: string;
}
export const createLostItemRef: CreateLostItemRef;

export function createLostItem(vars: CreateLostItemVariables): MutationPromise<CreateLostItemData, CreateLostItemVariables>;
export function createLostItem(dc: DataConnect, vars: CreateLostItemVariables): MutationPromise<CreateLostItemData, CreateLostItemVariables>;

interface UpdateItemStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
  operationName: string;
}
export const updateItemStatusRef: UpdateItemStatusRef;

export function updateItemStatus(vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;
export function updateItemStatus(dc: DataConnect, vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;

interface CreateVerificationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVerificationVariables): MutationRef<CreateVerificationData, CreateVerificationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateVerificationVariables): MutationRef<CreateVerificationData, CreateVerificationVariables>;
  operationName: string;
}
export const createVerificationRef: CreateVerificationRef;

export function createVerification(vars: CreateVerificationVariables): MutationPromise<CreateVerificationData, CreateVerificationVariables>;
export function createVerification(dc: DataConnect, vars: CreateVerificationVariables): MutationPromise<CreateVerificationData, CreateVerificationVariables>;

interface CreateHandoverSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHandoverSessionVariables): MutationRef<CreateHandoverSessionData, CreateHandoverSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateHandoverSessionVariables): MutationRef<CreateHandoverSessionData, CreateHandoverSessionVariables>;
  operationName: string;
}
export const createHandoverSessionRef: CreateHandoverSessionRef;

export function createHandoverSession(vars: CreateHandoverSessionVariables): MutationPromise<CreateHandoverSessionData, CreateHandoverSessionVariables>;
export function createHandoverSession(dc: DataConnect, vars: CreateHandoverSessionVariables): MutationPromise<CreateHandoverSessionData, CreateHandoverSessionVariables>;

interface CreateEscrowTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEscrowTransactionVariables): MutationRef<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEscrowTransactionVariables): MutationRef<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;
  operationName: string;
}
export const createEscrowTransactionRef: CreateEscrowTransactionRef;

export function createEscrowTransaction(vars: CreateEscrowTransactionVariables): MutationPromise<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;
export function createEscrowTransaction(dc: DataConnect, vars: CreateEscrowTransactionVariables): MutationPromise<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;

interface ListActiveItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListActiveItemsVariables): QueryRef<ListActiveItemsData, ListActiveItemsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListActiveItemsVariables): QueryRef<ListActiveItemsData, ListActiveItemsVariables>;
  operationName: string;
}
export const listActiveItemsRef: ListActiveItemsRef;

export function listActiveItems(vars?: ListActiveItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListActiveItemsData, ListActiveItemsVariables>;
export function listActiveItems(dc: DataConnect, vars?: ListActiveItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListActiveItemsData, ListActiveItemsVariables>;

interface SearchItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchItemsVariables): QueryRef<SearchItemsData, SearchItemsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchItemsVariables): QueryRef<SearchItemsData, SearchItemsVariables>;
  operationName: string;
}
export const searchItemsRef: SearchItemsRef;

export function searchItems(vars: SearchItemsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchItemsData, SearchItemsVariables>;
export function searchItems(dc: DataConnect, vars: SearchItemsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchItemsData, SearchItemsVariables>;

interface GetItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetItemVariables): QueryRef<GetItemData, GetItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetItemVariables): QueryRef<GetItemData, GetItemVariables>;
  operationName: string;
}
export const getItemRef: GetItemRef;

export function getItem(vars: GetItemVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemData, GetItemVariables>;
export function getItem(dc: DataConnect, vars: GetItemVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemData, GetItemVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(vars: GetCurrentUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;
export function getCurrentUser(dc: DataConnect, vars: GetCurrentUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface GetMyFoundItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyFoundItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyFoundItemsData, undefined>;
  operationName: string;
}
export const getMyFoundItemsRef: GetMyFoundItemsRef;

export function getMyFoundItems(options?: ExecuteQueryOptions): QueryPromise<GetMyFoundItemsData, undefined>;
export function getMyFoundItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyFoundItemsData, undefined>;

interface GetMyLostItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyLostItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyLostItemsData, undefined>;
  operationName: string;
}
export const getMyLostItemsRef: GetMyLostItemsRef;

export function getMyLostItems(options?: ExecuteQueryOptions): QueryPromise<GetMyLostItemsData, undefined>;
export function getMyLostItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyLostItemsData, undefined>;

