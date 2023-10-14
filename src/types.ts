export type Config = {
    collections: { [k: string]: any; };
    globals: { [k: string]: any; };
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

export type GlobalsApi<T, LOCALES> = {
    get: (params?: BaseParams<LOCALES>) => Promise<T>;
    update: (params: UpdateGlobalParams<T, LOCALES>) => Promise<T>;
};

export type RPC<T extends Config, LOCALES> = {
    collections: { [P in keyof Collections<T>]: CollectionsApi<Collections<T>[P], LOCALES>; };
    globals: { [P in keyof Globals<T>]: GlobalsApi<Globals<T>[P], LOCALES>; };
};

export type FetchOptions = {
    apiUrl: string;
    cache?: RequestCache;
    headers?: HeadersInit;
};

export type Operand<T> =
    | { equals: T; }
    | { not_equals: T; }
    | { greater_than: T; }
    | { greater_than_equal: T; }
    | { less_than: T; }
    | { less_than_equal: T; }
    | { like: string; }
    | { contains: string; }
    | { in: string; }
    | { not_in: string; }
    | { all: string; }
    | { exists: boolean; }
    | { near: string; }

export type Filter<T> =
    | { [P in keyof T]?: Operand<T[P]>; }
    | { and: Array<Filter<T>>; }
    | { or: Array<Filter<T>>; }

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
    docs: T[]
    totalDocs: number
    limit: number
    totalPages: number
    page?: number
    pagingCounter: number
    hasPrevPage: boolean
    hasNextPage: boolean
    prevPage?: number | null | undefined
    nextPage?: number | null | undefined
};

export type CreateParams<T, LOCALES> = BaseParams<LOCALES> & {
    doc: T;
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
