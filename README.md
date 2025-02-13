# payload-rest-client

A typesafe rest api client for the [payload cms](https://payloadcms.com).

## Quick Start 

1. Assume you have a users (auth enabled) and a posts collection with following fields:

```ts
interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}

interface Post {
    id: string;
    title: string;
    content: string;
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
});
```

3. Now you can use all available queries for all collections and globals in a typesafe way:

```ts
// if you wan't to use protected routes, use login api...
const loginResponse = await client.collections.users.login({
    email: process.env.PAYLOAD_API_EMAIL,
    password: process.env.PAYLOAD_API_PASSWORD,
});

// ...and create another client with authorization header
const protectedClient = createClient<Config, Locales>({
    apiUrl: "http://localhost:4000/api",
    headers: {
        "Authorization": `Bearer ${loginResponse.token}`,
    },
});

const posts = await protectedClient.collections.posts.find({
    sort: "title", // only top level keys (optionally prefixed with "-") of Post allowed
    locale: "de", // only defined locales allowed
    limit: 10,
    page: 2,
});

console.log(posts); // type of posts is FindResult<Post> 
```

## Custom Endpoints

1. Define input and output types for alle custom endpoints:

```ts
import { CustomEndpoint } from "payload-rest-client";

/**
 * shape of generic CustomEndpoint type
 *
 * type Input = {
 *     params?: Record<string, string>;
 *     query?: Record<string, any>;
 *     body?: any;
 * };
 *
 * type Output = any;
 *
 * type CustomEndpoint<Input, Output>;
 */

type CustomEndpoints = {
    greet: CustomEndpoint<{
        params: { name: string };
        query: { locale: Locales };
    }, string>,
};
```

2. Add it to `createClient` function:

```diff
-const client = createClient<Config, Locales>({
-    apiUrl: "http://localhost:4000/api",
-});
+const client = createClient<Config, Locales, CustomEndpoints>({
+    apiUrl: "http://localhost:4000/api",
+    customEndpoints: {
+        greet: { method: "GET", path: params => `hello/${params.name}` },
+    },
+});
```

3. Call custom endpoints like this:

```ts
const greeting = await client.custom.greet({
    params: { name: "John Doe" },
    query: { locale: "en" },
});
```

## API

[Full documentation of the rest api](https://payloadcms.com/docs/rest-api/overview)

### Client options

- apiUrl: string;
- cache?: RequestCache;
- headers?: HeadersInit;
- debug?: boolean;
- getAdditionalFetchOptions?: (params: GetAdditionalFetchOptionsParams) => any;
- customFetchFn? (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;

### Collections

- find: (params?: FindParams<T, LOCALES>) => Promise<FindResult<T>>;
- findById: (params: FindByIdParams<LOCALES>) => Promise<T>;
- count: (params: CountParams<T>) => Promise<CountResult>;
- create: (params: CreateParams<T, LOCALES>) => Promise<CreateResult<T>>;
- createDraft: (params: CreateDraftParams<T, LOCALES>) => Promise<CreateDraftResult<T>>;
- update: (params: UpdateParams<T, LOCALES>) => Promise<UpdateResult<T>>;
- updateById: (params: UpdateByIdParams<T, LOCALES>) => Promise<UpdateByIdResult<T>>;
- delete: (params?: DeleteParams<T, LOCALES>) => Promise<DeleteResult<T>>;
- deleteById: (params: DeleteByIdParams<LOCALES>) => Promise<T>;

### Collections with auth enabled (additional to above)

- login: (params: LoginParams) => Promise<LoginResult<T>>;
- logout: (params: LogoutParams) => Promise<LogoutResult>;
- unlock: (params: UnlockParams) => Promise<UnlockResult>;
- refresh-token: (params: RefreshTokenParams) => Promise<RefreshTokenResult>;
- me: (params: MeParams) => Promise<MeResult<T>>;
- forgot-password: (params: ForgotPasswordParams) => Promise<ForgotPasswordResult>;
- reset-password: (params: ResetPasswordParams) => Promise<ResetPasswordResult<T>>;

### Globals

- get: (params?: BaseParams<LOCALES>) => Promise<T>;
- update: (params: UpdateGlobalParams<T, LOCALES>) => Promise<T>;

### Others

- access: () => Promise<AccessResult>;

## Changelog

### v 3.0.3

- Added custom endpoints

### v 3.0.3

- Added option to use custom fetch function

### v 3.0.2

- Export error types
- Added access api

### v 3.0.1

- Better type inference for joins

### v 3.0.0

- Payload 3 (for Payload 2 use older versions)
- Added `select`, `populate` and `join` params
- Added `count` api

