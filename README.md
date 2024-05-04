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

## API

[Full documentation of the rest api](https://payloadcms.com/docs/rest-api/overview)

### Client options

- apiUrl: string;
- cache?: RequestCache;
- headers?: HeadersInit;
- debug?: boolean;
- getAdditionalFetchOptions?: (params: GetAdditionalFetchOptionsParams) => any

### Collections

- find: (params?: FindParams<T, LOCALES>) => Promise<FindResult<T>>;
- findById: (params: FindByIdParams<LOCALES>) => Promise<T>;
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
