# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, createFoundItem, createLostItem, updateItemStatus, createVerification, createHandoverSession, createEscrowTransaction, listActiveItems, searchItems, getItem } from '@lost-it-found-it/dataconnect';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation CreateFoundItem:  For variables, look at type CreateFoundItemVars in ../index.d.ts
const { data } = await CreateFoundItem(dataConnect, createFoundItemVars);

// Operation CreateLostItem:  For variables, look at type CreateLostItemVars in ../index.d.ts
const { data } = await CreateLostItem(dataConnect, createLostItemVars);

// Operation UpdateItemStatus:  For variables, look at type UpdateItemStatusVars in ../index.d.ts
const { data } = await UpdateItemStatus(dataConnect, updateItemStatusVars);

// Operation CreateVerification:  For variables, look at type CreateVerificationVars in ../index.d.ts
const { data } = await CreateVerification(dataConnect, createVerificationVars);

// Operation CreateHandoverSession:  For variables, look at type CreateHandoverSessionVars in ../index.d.ts
const { data } = await CreateHandoverSession(dataConnect, createHandoverSessionVars);

// Operation CreateEscrowTransaction:  For variables, look at type CreateEscrowTransactionVars in ../index.d.ts
const { data } = await CreateEscrowTransaction(dataConnect, createEscrowTransactionVars);

// Operation ListActiveItems:  For variables, look at type ListActiveItemsVars in ../index.d.ts
const { data } = await ListActiveItems(dataConnect, listActiveItemsVars);

// Operation SearchItems:  For variables, look at type SearchItemsVars in ../index.d.ts
const { data } = await SearchItems(dataConnect, searchItemsVars);

// Operation GetItem:  For variables, look at type GetItemVars in ../index.d.ts
const { data } = await GetItem(dataConnect, getItemVars);


```