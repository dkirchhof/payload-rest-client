export type Config = {
    collections: { [k: string]: any };
    globals: { [k: string]: any };
};

export type DocWithAuth = {
    email: string | null;
    password: string | null;
};

export type Collections<T extends Config> = T["collections"];
export type Globals<T extends Config> = T["globals"];

export type CollectionsApi<T, LOCALES> = {
    find: (params?: FindParams<T, LOCALES>) => Promise<FindResult<T>>;
    findById: (params: FindByIdParams<LOCALES>) => Promise<T>;
    create: (params: CreateParams<T, LOCALES>) => Promise<CreateResult<T>>;
    update: (params: UpdateParams<T, LOCALES>) => Promise<UpdateResult<T>>;
    updateById: (params: UpdateByIdParams<T, LOCALES>) => Promise<UpdateByIdResult<T>>;
    delete: (params?: DeleteParams<T, LOCALES>) => Promise<DeleteResult<T>>;
    deleteById: (params: DeleteByIdParams<LOCALES>) => Promise<T>;
};

export type CollectionsWithAuthApi<T, LOCALES> = CollectionsApi<T, LOCALES> & {
    login: (params: LoginParams) => Promise<LoginResult<T>>;
    logout: (params: LogoutParams) => Promise<LogoutResult>;
    unlock: (params: UnlockParams) => Promise<UnlockResult>;
    "refresh-token": (params: RefreshTokenParams) => Promise<RefreshTokenResult>;
    // verify
    me: (params: MeParams) => Promise<MeResult<T>>;
    "forgot-password": (params: ForgotPasswordParams) => Promise<ForgotPasswordResult>;
    "reset-password": (params: ResetPasswordParams) => Promise<ResetPasswordResult<T>>;
};

export type GlobalsApi<T, LOCALES> = {
    get: (params?: BaseParams<LOCALES>) => Promise<T>;
    update: (params: UpdateGlobalParams<T, LOCALES>) => Promise<T>;
};

export type RPC<T extends Config, LOCALES> = {
    collections: {
        [P in keyof Collections<T>]: Collections<T>[P] extends DocWithAuth //{email:string,password:string}
            ? CollectionsWithAuthApi<Collections<T>[P], LOCALES>
            : CollectionsApi<Collections<T>[P], LOCALES>;
    };
    globals: {
        [P in keyof Globals<T>]: GlobalsApi<Globals<T>[P], LOCALES>;
    };
};

export type GetAdditionalFetchOptionsParams = {
    type: "collection" | "global";
    slug: string;
    method: string;
    url: string;
};

export type FetchOptions = {
    apiUrl: string;
    cache?: RequestCache;
    headers?: HeadersInit;
    debug?: boolean;
    getAdditionalFetchOptions?: (params: GetAdditionalFetchOptionsParams) => any;
};

export type MessageResult = {
    message: string;
};

export type Operand<T> =
    | { equals: T }
    | { not_equals: T }
    | { greater_than: T }
    | { greater_than_equal: T }
    | { less_than: T }
    | { less_than_equal: T }
    | { like: string }
    | { contains: string }
    | { in: string }
    | { not_in: string }
    | { all: string }
    | { exists: boolean }
    | { near: string };

export type Filter<T> =
    | { [P in keyof T]?: Operand<T[P]> }
    | { and: Array<Filter<T>> }
    | { or: Array<Filter<T>> };

export type BaseParams<LOCALES> = {
    depth?: number;
    locale?: LOCALES;
    fallbackLocale?: LOCALES | "null" | "false" | "none";
};

export type FindParams<T, LOCALES> = BaseParams<LOCALES> & {
    sort?: keyof T extends string ? keyof T | `-${keyof T}` : never;
    where?: Filter<T>;
    limit?: number;
    page?: number;
};

export type FindByIdParams<LOCALES> = BaseParams<LOCALES> & {
    id: string;
};

export type FindResult<T> = {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page?: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage?: number | null | undefined;
    nextPage?: number | null | undefined;
};

export type CreateParams<T, LOCALES> = BaseParams<LOCALES> & {
    doc: Omit<T, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
        createdAt?: string;
        updatedAt?: string;
    };
};

export type CreateResult<T> = {
    message: string;
    doc: T;
};

export type UpdateParams<T, LOCALES> = BaseParams<LOCALES> & {
    patch: Partial<T>;
    where?: Filter<T>;
};

export type UpdateResult<T> = {
    docs: T[];
    errors: string[];
};

export type UpdateByIdParams<T, LOCALES> = BaseParams<LOCALES> & {
    id: string;
    patch: Partial<T>;
};

export type UpdateGlobalParams<T, LOCALES> = BaseParams<LOCALES> & {
    patch: Partial<T>;
};

export type UpdateByIdResult<T> = {
    message: string;
    doc: T;
};

export type DeleteParams<T, LOCALES> = BaseParams<LOCALES> & {
    where?: Filter<T>;
};

export type DeleteByIdParams<LOCALES> = BaseParams<LOCALES> & {
    id: string;
};

export type DeleteResult<T> = {
    docs: T[];
    errors: string[];
};

export type LoginParams = {
    email: string;
    password: string;
};

export type LoginResult<T> = {
    message: string;
    user: T;
    token: string;
    exp: number;
};

export type LogoutParams = void;

export type LogoutResult = MessageResult;

export type UnlockParams = {
    email: string;
};

export type UnlockResult = MessageResult;

export type RefreshTokenParams = void;

export type RefreshTokenResult = {
    message: string;
    refreshedToken: string;
    exp: number;
    user: {
        id: string;
        email: string;
        collection: string;
    };
};

export type MeParams = void;

export type MeResult<T> = {
    collection: string;
    user: T & { _strategy: string };
    token: string;
    exp: number;
};

export type ForgotPasswordParams = {
    email: string;
};

export type ForgotPasswordResult = MessageResult;

export type ResetPasswordParams = {
    token: string;
    password: string;
};

export type ResetPasswordResult<T> = {
    message: string;
    user: T;
    token: string;
};
