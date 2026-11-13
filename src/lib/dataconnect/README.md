# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListActiveItems*](#listactiveitems)
  - [*SearchItems*](#searchitems)
  - [*GetItem*](#getitem)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*GetMyFoundItems*](#getmyfounditems)
  - [*GetMyLostItems*](#getmylostitems)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*CreateFoundItem*](#createfounditem)
  - [*CreateLostItem*](#createlostitem)
  - [*UpdateItemStatus*](#updateitemstatus)
  - [*CreateVerification*](#createverification)
  - [*CreateHandoverSession*](#createhandoversession)
  - [*CreateEscrowTransaction*](#createescrowtransaction)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@lost-it-found-it/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@lost-it-found-it/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@lost-it-found-it/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListActiveItems
You can execute the `ListActiveItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listActiveItems(vars?: ListActiveItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListActiveItemsData, ListActiveItemsVariables>;

interface ListActiveItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListActiveItemsVariables): QueryRef<ListActiveItemsData, ListActiveItemsVariables>;
}
export const listActiveItemsRef: ListActiveItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listActiveItems(dc: DataConnect, vars?: ListActiveItemsVariables, options?: ExecuteQueryOptions): QueryPromise<ListActiveItemsData, ListActiveItemsVariables>;

interface ListActiveItemsRef {
  ...
  (dc: DataConnect, vars?: ListActiveItemsVariables): QueryRef<ListActiveItemsData, ListActiveItemsVariables>;
}
export const listActiveItemsRef: ListActiveItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listActiveItemsRef:
```typescript
const name = listActiveItemsRef.operationName;
console.log(name);
```

### Variables
The `ListActiveItems` query has an optional argument of type `ListActiveItemsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListActiveItemsVariables {
  type?: ItemType | null;
  category?: Category | null;
  district?: string | null;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `ListActiveItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListActiveItemsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListActiveItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listActiveItems, ListActiveItemsVariables } from '@lost-it-found-it/dataconnect';

// The `ListActiveItems` query has an optional argument of type `ListActiveItemsVariables`:
const listActiveItemsVars: ListActiveItemsVariables = {
  type: ..., // optional
  category: ..., // optional
  district: ..., // optional
  limit: ..., // optional
};

// Call the `listActiveItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listActiveItems(listActiveItemsVars);
// Variables can be defined inline as well.
const { data } = await listActiveItems({ type: ..., category: ..., district: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `ListActiveItemsVariables` argument.
const { data } = await listActiveItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listActiveItems(dataConnect, listActiveItemsVars);

console.log(data.items);

// Or, you can use the `Promise` API.
listActiveItems(listActiveItemsVars).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `ListActiveItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listActiveItemsRef, ListActiveItemsVariables } from '@lost-it-found-it/dataconnect';

// The `ListActiveItems` query has an optional argument of type `ListActiveItemsVariables`:
const listActiveItemsVars: ListActiveItemsVariables = {
  type: ..., // optional
  category: ..., // optional
  district: ..., // optional
  limit: ..., // optional
};

// Call the `listActiveItemsRef()` function to get a reference to the query.
const ref = listActiveItemsRef(listActiveItemsVars);
// Variables can be defined inline as well.
const ref = listActiveItemsRef({ type: ..., category: ..., district: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `ListActiveItemsVariables` argument.
const ref = listActiveItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listActiveItemsRef(dataConnect, listActiveItemsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

## SearchItems
You can execute the `SearchItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
searchItems(vars: SearchItemsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchItemsData, SearchItemsVariables>;

interface SearchItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchItemsVariables): QueryRef<SearchItemsData, SearchItemsVariables>;
}
export const searchItemsRef: SearchItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchItems(dc: DataConnect, vars: SearchItemsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchItemsData, SearchItemsVariables>;

interface SearchItemsRef {
  ...
  (dc: DataConnect, vars: SearchItemsVariables): QueryRef<SearchItemsData, SearchItemsVariables>;
}
export const searchItemsRef: SearchItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchItemsRef:
```typescript
const name = searchItemsRef.operationName;
console.log(name);
```

### Variables
The `SearchItems` query requires an argument of type `SearchItemsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchItemsVariables {
  query: string;
}
```
### Return Type
Recall that executing the `SearchItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchItemsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `SearchItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchItems, SearchItemsVariables } from '@lost-it-found-it/dataconnect';

// The `SearchItems` query requires an argument of type `SearchItemsVariables`:
const searchItemsVars: SearchItemsVariables = {
  query: ..., 
};

// Call the `searchItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchItems(searchItemsVars);
// Variables can be defined inline as well.
const { data } = await searchItems({ query: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchItems(dataConnect, searchItemsVars);

console.log(data.items_search);

// Or, you can use the `Promise` API.
searchItems(searchItemsVars).then((response) => {
  const data = response.data;
  console.log(data.items_search);
});
```

### Using `SearchItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchItemsRef, SearchItemsVariables } from '@lost-it-found-it/dataconnect';

// The `SearchItems` query requires an argument of type `SearchItemsVariables`:
const searchItemsVars: SearchItemsVariables = {
  query: ..., 
};

// Call the `searchItemsRef()` function to get a reference to the query.
const ref = searchItemsRef(searchItemsVars);
// Variables can be defined inline as well.
const ref = searchItemsRef({ query: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchItemsRef(dataConnect, searchItemsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items_search);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items_search);
});
```

## GetItem
You can execute the `GetItem` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getItem(vars: GetItemVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemData, GetItemVariables>;

interface GetItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetItemVariables): QueryRef<GetItemData, GetItemVariables>;
}
export const getItemRef: GetItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getItem(dc: DataConnect, vars: GetItemVariables, options?: ExecuteQueryOptions): QueryPromise<GetItemData, GetItemVariables>;

interface GetItemRef {
  ...
  (dc: DataConnect, vars: GetItemVariables): QueryRef<GetItemData, GetItemVariables>;
}
export const getItemRef: GetItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getItemRef:
```typescript
const name = getItemRef.operationName;
console.log(name);
```

### Variables
The `GetItem` query requires an argument of type `GetItemVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetItemVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetItem` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetItemData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getItem, GetItemVariables } from '@lost-it-found-it/dataconnect';

// The `GetItem` query requires an argument of type `GetItemVariables`:
const getItemVars: GetItemVariables = {
  id: ..., 
};

// Call the `getItem()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getItem(getItemVars);
// Variables can be defined inline as well.
const { data } = await getItem({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getItem(dataConnect, getItemVars);

console.log(data.item);

// Or, you can use the `Promise` API.
getItem(getItemVars).then((response) => {
  const data = response.data;
  console.log(data.item);
});
```

### Using `GetItem`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getItemRef, GetItemVariables } from '@lost-it-found-it/dataconnect';

// The `GetItem` query requires an argument of type `GetItemVariables`:
const getItemVars: GetItemVariables = {
  id: ..., 
};

// Call the `getItemRef()` function to get a reference to the query.
const ref = getItemRef(getItemVars);
// Variables can be defined inline as well.
const ref = getItemRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getItemRef(dataConnect, getItemVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.item);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.item);
});
```

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(vars: GetCurrentUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, vars: GetCurrentUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect, vars: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query requires an argument of type `GetCurrentUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCurrentUserVariables {
  id: string;
}
```
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser, GetCurrentUserVariables } from '@lost-it-found-it/dataconnect';

// The `GetCurrentUser` query requires an argument of type `GetCurrentUserVariables`:
const getCurrentUserVars: GetCurrentUserVariables = {
  id: ..., 
};

// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser(getCurrentUserVars);
// Variables can be defined inline as well.
const { data } = await getCurrentUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect, getCurrentUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser(getCurrentUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef, GetCurrentUserVariables } from '@lost-it-found-it/dataconnect';

// The `GetCurrentUser` query requires an argument of type `GetCurrentUserVariables`:
const getCurrentUserVars: GetCurrentUserVariables = {
  id: ..., 
};

// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef(getCurrentUserVars);
// Variables can be defined inline as well.
const ref = getCurrentUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect, getCurrentUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetMyFoundItems
You can execute the `GetMyFoundItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMyFoundItems(options?: ExecuteQueryOptions): QueryPromise<GetMyFoundItemsData, undefined>;

interface GetMyFoundItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyFoundItemsData, undefined>;
}
export const getMyFoundItemsRef: GetMyFoundItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyFoundItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyFoundItemsData, undefined>;

interface GetMyFoundItemsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyFoundItemsData, undefined>;
}
export const getMyFoundItemsRef: GetMyFoundItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyFoundItemsRef:
```typescript
const name = getMyFoundItemsRef.operationName;
console.log(name);
```

### Variables
The `GetMyFoundItems` query has no variables.
### Return Type
Recall that executing the `GetMyFoundItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyFoundItemsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyFoundItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyFoundItems } from '@lost-it-found-it/dataconnect';


// Call the `getMyFoundItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyFoundItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyFoundItems(dataConnect);

console.log(data.items);

// Or, you can use the `Promise` API.
getMyFoundItems().then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `GetMyFoundItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyFoundItemsRef } from '@lost-it-found-it/dataconnect';


// Call the `getMyFoundItemsRef()` function to get a reference to the query.
const ref = getMyFoundItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyFoundItemsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

## GetMyLostItems
You can execute the `GetMyLostItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMyLostItems(options?: ExecuteQueryOptions): QueryPromise<GetMyLostItemsData, undefined>;

interface GetMyLostItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyLostItemsData, undefined>;
}
export const getMyLostItemsRef: GetMyLostItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyLostItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyLostItemsData, undefined>;

interface GetMyLostItemsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyLostItemsData, undefined>;
}
export const getMyLostItemsRef: GetMyLostItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyLostItemsRef:
```typescript
const name = getMyLostItemsRef.operationName;
console.log(name);
```

### Variables
The `GetMyLostItems` query has no variables.
### Return Type
Recall that executing the `GetMyLostItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyLostItemsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyLostItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyLostItems } from '@lost-it-found-it/dataconnect';


// Call the `getMyLostItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyLostItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyLostItems(dataConnect);

console.log(data.items);

// Or, you can use the `Promise` API.
getMyLostItems().then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `GetMyLostItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyLostItemsRef } from '@lost-it-found-it/dataconnect';


// Call the `getMyLostItemsRef()` function to get a reference to the query.
const ref = getMyLostItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyLostItemsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  phone: string;
  fullName: string;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@lost-it-found-it/dataconnect';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  phone: ..., 
  fullName: ..., 
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ phone: ..., fullName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@lost-it-found-it/dataconnect';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  phone: ..., 
  fullName: ..., 
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ phone: ..., fullName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## CreateFoundItem
You can execute the `CreateFoundItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createFoundItem(vars: CreateFoundItemVariables): MutationPromise<CreateFoundItemData, CreateFoundItemVariables>;

interface CreateFoundItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFoundItemVariables): MutationRef<CreateFoundItemData, CreateFoundItemVariables>;
}
export const createFoundItemRef: CreateFoundItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFoundItem(dc: DataConnect, vars: CreateFoundItemVariables): MutationPromise<CreateFoundItemData, CreateFoundItemVariables>;

interface CreateFoundItemRef {
  ...
  (dc: DataConnect, vars: CreateFoundItemVariables): MutationRef<CreateFoundItemData, CreateFoundItemVariables>;
}
export const createFoundItemRef: CreateFoundItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFoundItemRef:
```typescript
const name = createFoundItemRef.operationName;
console.log(name);
```

### Variables
The `CreateFoundItem` mutation requires an argument of type `CreateFoundItemVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateFoundItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFoundItemData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFoundItemData {
  item_insert: Item_Key;
}
```
### Using `CreateFoundItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFoundItem, CreateFoundItemVariables } from '@lost-it-found-it/dataconnect';

// The `CreateFoundItem` mutation requires an argument of type `CreateFoundItemVariables`:
const createFoundItemVars: CreateFoundItemVariables = {
  category: ..., 
  title: ..., 
  description: ..., // optional
  publicBlurredUrl: ..., // optional
  privateRawUrl: ..., // optional
  district: ..., 
  sector: ..., 
  meetingPoint: ..., // optional
  feeOrReward: ..., // optional
  maskedDocNumber: ..., // optional
  expiresAt: ..., 
};

// Call the `createFoundItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFoundItem(createFoundItemVars);
// Variables can be defined inline as well.
const { data } = await createFoundItem({ category: ..., title: ..., description: ..., publicBlurredUrl: ..., privateRawUrl: ..., district: ..., sector: ..., meetingPoint: ..., feeOrReward: ..., maskedDocNumber: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFoundItem(dataConnect, createFoundItemVars);

console.log(data.item_insert);

// Or, you can use the `Promise` API.
createFoundItem(createFoundItemVars).then((response) => {
  const data = response.data;
  console.log(data.item_insert);
});
```

### Using `CreateFoundItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFoundItemRef, CreateFoundItemVariables } from '@lost-it-found-it/dataconnect';

// The `CreateFoundItem` mutation requires an argument of type `CreateFoundItemVariables`:
const createFoundItemVars: CreateFoundItemVariables = {
  category: ..., 
  title: ..., 
  description: ..., // optional
  publicBlurredUrl: ..., // optional
  privateRawUrl: ..., // optional
  district: ..., 
  sector: ..., 
  meetingPoint: ..., // optional
  feeOrReward: ..., // optional
  maskedDocNumber: ..., // optional
  expiresAt: ..., 
};

// Call the `createFoundItemRef()` function to get a reference to the mutation.
const ref = createFoundItemRef(createFoundItemVars);
// Variables can be defined inline as well.
const ref = createFoundItemRef({ category: ..., title: ..., description: ..., publicBlurredUrl: ..., privateRawUrl: ..., district: ..., sector: ..., meetingPoint: ..., feeOrReward: ..., maskedDocNumber: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFoundItemRef(dataConnect, createFoundItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.item_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.item_insert);
});
```

## CreateLostItem
You can execute the `CreateLostItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createLostItem(vars: CreateLostItemVariables): MutationPromise<CreateLostItemData, CreateLostItemVariables>;

interface CreateLostItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLostItemVariables): MutationRef<CreateLostItemData, CreateLostItemVariables>;
}
export const createLostItemRef: CreateLostItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLostItem(dc: DataConnect, vars: CreateLostItemVariables): MutationPromise<CreateLostItemData, CreateLostItemVariables>;

interface CreateLostItemRef {
  ...
  (dc: DataConnect, vars: CreateLostItemVariables): MutationRef<CreateLostItemData, CreateLostItemVariables>;
}
export const createLostItemRef: CreateLostItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLostItemRef:
```typescript
const name = createLostItemRef.operationName;
console.log(name);
```

### Variables
The `CreateLostItem` mutation requires an argument of type `CreateLostItemVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateLostItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLostItemData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLostItemData {
  item_insert: Item_Key;
}
```
### Using `CreateLostItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLostItem, CreateLostItemVariables } from '@lost-it-found-it/dataconnect';

// The `CreateLostItem` mutation requires an argument of type `CreateLostItemVariables`:
const createLostItemVars: CreateLostItemVariables = {
  category: ..., 
  title: ..., 
  description: ..., // optional
  district: ..., 
  sector: ..., 
  meetingPoint: ..., // optional
  feeOrReward: ..., // optional
  maskedDocNumber: ..., // optional
  expiresAt: ..., 
};

// Call the `createLostItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLostItem(createLostItemVars);
// Variables can be defined inline as well.
const { data } = await createLostItem({ category: ..., title: ..., description: ..., district: ..., sector: ..., meetingPoint: ..., feeOrReward: ..., maskedDocNumber: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLostItem(dataConnect, createLostItemVars);

console.log(data.item_insert);

// Or, you can use the `Promise` API.
createLostItem(createLostItemVars).then((response) => {
  const data = response.data;
  console.log(data.item_insert);
});
```

### Using `CreateLostItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLostItemRef, CreateLostItemVariables } from '@lost-it-found-it/dataconnect';

// The `CreateLostItem` mutation requires an argument of type `CreateLostItemVariables`:
const createLostItemVars: CreateLostItemVariables = {
  category: ..., 
  title: ..., 
  description: ..., // optional
  district: ..., 
  sector: ..., 
  meetingPoint: ..., // optional
  feeOrReward: ..., // optional
  maskedDocNumber: ..., // optional
  expiresAt: ..., 
};

// Call the `createLostItemRef()` function to get a reference to the mutation.
const ref = createLostItemRef(createLostItemVars);
// Variables can be defined inline as well.
const ref = createLostItemRef({ category: ..., title: ..., description: ..., district: ..., sector: ..., meetingPoint: ..., feeOrReward: ..., maskedDocNumber: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLostItemRef(dataConnect, createLostItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.item_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.item_insert);
});
```

## UpdateItemStatus
You can execute the `UpdateItemStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateItemStatus(vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;

interface UpdateItemStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
}
export const updateItemStatusRef: UpdateItemStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateItemStatus(dc: DataConnect, vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;

interface UpdateItemStatusRef {
  ...
  (dc: DataConnect, vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
}
export const updateItemStatusRef: UpdateItemStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateItemStatusRef:
```typescript
const name = updateItemStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateItemStatus` mutation requires an argument of type `UpdateItemStatusVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateItemStatusVariables {
  id: UUIDString;
  status: ItemStatus;
}
```
### Return Type
Recall that executing the `UpdateItemStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateItemStatusData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateItemStatusData {
  item_update?: Item_Key | null;
}
```
### Using `UpdateItemStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateItemStatus, UpdateItemStatusVariables } from '@lost-it-found-it/dataconnect';

// The `UpdateItemStatus` mutation requires an argument of type `UpdateItemStatusVariables`:
const updateItemStatusVars: UpdateItemStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateItemStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateItemStatus(updateItemStatusVars);
// Variables can be defined inline as well.
const { data } = await updateItemStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateItemStatus(dataConnect, updateItemStatusVars);

console.log(data.item_update);

// Or, you can use the `Promise` API.
updateItemStatus(updateItemStatusVars).then((response) => {
  const data = response.data;
  console.log(data.item_update);
});
```

### Using `UpdateItemStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateItemStatusRef, UpdateItemStatusVariables } from '@lost-it-found-it/dataconnect';

// The `UpdateItemStatus` mutation requires an argument of type `UpdateItemStatusVariables`:
const updateItemStatusVars: UpdateItemStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateItemStatusRef()` function to get a reference to the mutation.
const ref = updateItemStatusRef(updateItemStatusVars);
// Variables can be defined inline as well.
const ref = updateItemStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateItemStatusRef(dataConnect, updateItemStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.item_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.item_update);
});
```

## CreateVerification
You can execute the `CreateVerification` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createVerification(vars: CreateVerificationVariables): MutationPromise<CreateVerificationData, CreateVerificationVariables>;

interface CreateVerificationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVerificationVariables): MutationRef<CreateVerificationData, CreateVerificationVariables>;
}
export const createVerificationRef: CreateVerificationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createVerification(dc: DataConnect, vars: CreateVerificationVariables): MutationPromise<CreateVerificationData, CreateVerificationVariables>;

interface CreateVerificationRef {
  ...
  (dc: DataConnect, vars: CreateVerificationVariables): MutationRef<CreateVerificationData, CreateVerificationVariables>;
}
export const createVerificationRef: CreateVerificationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createVerificationRef:
```typescript
const name = createVerificationRef.operationName;
console.log(name);
```

### Variables
The `CreateVerification` mutation requires an argument of type `CreateVerificationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateVerificationVariables {
  itemId: UUIDString;
  secretPrompt?: string | null;
  secretAnswer?: string | null;
}
```
### Return Type
Recall that executing the `CreateVerification` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateVerificationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateVerificationData {
  verification_insert: Verification_Key;
}
```
### Using `CreateVerification`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createVerification, CreateVerificationVariables } from '@lost-it-found-it/dataconnect';

// The `CreateVerification` mutation requires an argument of type `CreateVerificationVariables`:
const createVerificationVars: CreateVerificationVariables = {
  itemId: ..., 
  secretPrompt: ..., // optional
  secretAnswer: ..., // optional
};

// Call the `createVerification()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createVerification(createVerificationVars);
// Variables can be defined inline as well.
const { data } = await createVerification({ itemId: ..., secretPrompt: ..., secretAnswer: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createVerification(dataConnect, createVerificationVars);

console.log(data.verification_insert);

// Or, you can use the `Promise` API.
createVerification(createVerificationVars).then((response) => {
  const data = response.data;
  console.log(data.verification_insert);
});
```

### Using `CreateVerification`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createVerificationRef, CreateVerificationVariables } from '@lost-it-found-it/dataconnect';

// The `CreateVerification` mutation requires an argument of type `CreateVerificationVariables`:
const createVerificationVars: CreateVerificationVariables = {
  itemId: ..., 
  secretPrompt: ..., // optional
  secretAnswer: ..., // optional
};

// Call the `createVerificationRef()` function to get a reference to the mutation.
const ref = createVerificationRef(createVerificationVars);
// Variables can be defined inline as well.
const ref = createVerificationRef({ itemId: ..., secretPrompt: ..., secretAnswer: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createVerificationRef(dataConnect, createVerificationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.verification_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.verification_insert);
});
```

## CreateHandoverSession
You can execute the `CreateHandoverSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createHandoverSession(vars: CreateHandoverSessionVariables): MutationPromise<CreateHandoverSessionData, CreateHandoverSessionVariables>;

interface CreateHandoverSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHandoverSessionVariables): MutationRef<CreateHandoverSessionData, CreateHandoverSessionVariables>;
}
export const createHandoverSessionRef: CreateHandoverSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createHandoverSession(dc: DataConnect, vars: CreateHandoverSessionVariables): MutationPromise<CreateHandoverSessionData, CreateHandoverSessionVariables>;

interface CreateHandoverSessionRef {
  ...
  (dc: DataConnect, vars: CreateHandoverSessionVariables): MutationRef<CreateHandoverSessionData, CreateHandoverSessionVariables>;
}
export const createHandoverSessionRef: CreateHandoverSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createHandoverSessionRef:
```typescript
const name = createHandoverSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateHandoverSession` mutation requires an argument of type `CreateHandoverSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateHandoverSessionVariables {
  itemId: UUIDString;
  qrToken: string;
}
```
### Return Type
Recall that executing the `CreateHandoverSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateHandoverSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateHandoverSessionData {
  handoverSession_insert: HandoverSession_Key;
}
```
### Using `CreateHandoverSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createHandoverSession, CreateHandoverSessionVariables } from '@lost-it-found-it/dataconnect';

// The `CreateHandoverSession` mutation requires an argument of type `CreateHandoverSessionVariables`:
const createHandoverSessionVars: CreateHandoverSessionVariables = {
  itemId: ..., 
  qrToken: ..., 
};

// Call the `createHandoverSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createHandoverSession(createHandoverSessionVars);
// Variables can be defined inline as well.
const { data } = await createHandoverSession({ itemId: ..., qrToken: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createHandoverSession(dataConnect, createHandoverSessionVars);

console.log(data.handoverSession_insert);

// Or, you can use the `Promise` API.
createHandoverSession(createHandoverSessionVars).then((response) => {
  const data = response.data;
  console.log(data.handoverSession_insert);
});
```

### Using `CreateHandoverSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createHandoverSessionRef, CreateHandoverSessionVariables } from '@lost-it-found-it/dataconnect';

// The `CreateHandoverSession` mutation requires an argument of type `CreateHandoverSessionVariables`:
const createHandoverSessionVars: CreateHandoverSessionVariables = {
  itemId: ..., 
  qrToken: ..., 
};

// Call the `createHandoverSessionRef()` function to get a reference to the mutation.
const ref = createHandoverSessionRef(createHandoverSessionVars);
// Variables can be defined inline as well.
const ref = createHandoverSessionRef({ itemId: ..., qrToken: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createHandoverSessionRef(dataConnect, createHandoverSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.handoverSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.handoverSession_insert);
});
```

## CreateEscrowTransaction
You can execute the `CreateEscrowTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createEscrowTransaction(vars: CreateEscrowTransactionVariables): MutationPromise<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;

interface CreateEscrowTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEscrowTransactionVariables): MutationRef<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;
}
export const createEscrowTransactionRef: CreateEscrowTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEscrowTransaction(dc: DataConnect, vars: CreateEscrowTransactionVariables): MutationPromise<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;

interface CreateEscrowTransactionRef {
  ...
  (dc: DataConnect, vars: CreateEscrowTransactionVariables): MutationRef<CreateEscrowTransactionData, CreateEscrowTransactionVariables>;
}
export const createEscrowTransactionRef: CreateEscrowTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEscrowTransactionRef:
```typescript
const name = createEscrowTransactionRef.operationName;
console.log(name);
```

### Variables
The `CreateEscrowTransaction` mutation requires an argument of type `CreateEscrowTransactionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateEscrowTransactionVariables {
  itemId: UUIDString;
  amount: number;
  platformFee?: number | null;
  momoRef: string;
}
```
### Return Type
Recall that executing the `CreateEscrowTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEscrowTransactionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEscrowTransactionData {
  escrowTransaction_insert: EscrowTransaction_Key;
}
```
### Using `CreateEscrowTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEscrowTransaction, CreateEscrowTransactionVariables } from '@lost-it-found-it/dataconnect';

// The `CreateEscrowTransaction` mutation requires an argument of type `CreateEscrowTransactionVariables`:
const createEscrowTransactionVars: CreateEscrowTransactionVariables = {
  itemId: ..., 
  amount: ..., 
  platformFee: ..., // optional
  momoRef: ..., 
};

// Call the `createEscrowTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEscrowTransaction(createEscrowTransactionVars);
// Variables can be defined inline as well.
const { data } = await createEscrowTransaction({ itemId: ..., amount: ..., platformFee: ..., momoRef: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEscrowTransaction(dataConnect, createEscrowTransactionVars);

console.log(data.escrowTransaction_insert);

// Or, you can use the `Promise` API.
createEscrowTransaction(createEscrowTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.escrowTransaction_insert);
});
```

### Using `CreateEscrowTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEscrowTransactionRef, CreateEscrowTransactionVariables } from '@lost-it-found-it/dataconnect';

// The `CreateEscrowTransaction` mutation requires an argument of type `CreateEscrowTransactionVariables`:
const createEscrowTransactionVars: CreateEscrowTransactionVariables = {
  itemId: ..., 
  amount: ..., 
  platformFee: ..., // optional
  momoRef: ..., 
};

// Call the `createEscrowTransactionRef()` function to get a reference to the mutation.
const ref = createEscrowTransactionRef(createEscrowTransactionVars);
// Variables can be defined inline as well.
const ref = createEscrowTransactionRef({ itemId: ..., amount: ..., platformFee: ..., momoRef: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEscrowTransactionRef(dataConnect, createEscrowTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.escrowTransaction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.escrowTransaction_insert);
});
```

