# payload-rest-client

A typesafe rest api client for the [payload cms](https://payloadcms.com).

## Quick Start 

1. Assume you have a users collection with following fields:

```ts
interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}
```

2. Create the client:

```ts
import { createClient } from "payload-rest-client";
import { Config } from "./payload-types"; // auto generated types from payload

type Locales = "de" | "en";

const client = createClient<Config, Locales>({
    apiUrl: "http://localhost:4000/api",
    cache: "no-store",
});

```

3. Now you can use all available queries for all collections and globals in a typesafe way:

```ts
const users = await client.collections.users.find({
    sort: "name", // only top level keys (optionally prefixed with "-") of user allowed
    locale: "de", // only defined locales allowed
    limit: 10,
    page: 2,
});

console.log(users); // type of users is FindResult<User> 
```

## API

[Full documentation of the rest api](https://payloadcms.com/docs/rest-api/overview)

### Client options

- apiUrl: string;
- cache?: RequestCache;
- headers?: HeadersInit;
- debug?: boolean;

### Collections

- find: (params?: FindParams<T, LOCALES>) => Promise<FindResult<T>>;
- findById: (params: FindByIdParams<LOCALES>) => Promise<T>;
- create: (params: CreateParams<T, LOCALES>) => Promise<CreateResult<T>>;
- update: (params: UpdateParams<T, LOCALES>) => Promise<UpdateResult<T>>;
- updateById: (params: UpdateByIdParams<T, LOCALES>) => Promise<UpdateByIdResult<T>>;
- delete: (params?: DeleteParams<T, LOCALES>) => Promise<DeleteResult<T>>;
- deleteById: (params: DeleteByIdParams<LOCALES>) => Promise<T>;

### Globals

- get: (params?: BaseParams<LOCALES>) => Promise<T>;
- update: (params: UpdateGlobalParams<T, LOCALES>) => Promise<T>;
