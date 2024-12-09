export type Config = {
    collections: { [k: string]: any };
    collectionsSelect: { [k: string]: any };
    globals: { [k: string]: any };
    globalsSelect: { [k: string]: any };
};

export type Doc = {
    id: string | number;
};

export type DocWithAuth = {
    email: string;
    password?: string | null;
};

export type Collections<CONFIG extends Config> = CONFIG["collections"];
export type CollectionsSelect<CONFIG extends Config> = CONFIG["collectionsSelect"];
export type Globals<CONFIG extends Config> = CONFIG["globals"];
export type GlobalsSelect<CONFIG extends Config> = CONFIG["globalsSelect"];

export type CollectionsApi<CONFIG extends Config, LOCALES, DOC extends Doc, SELECT> = {
    find: (params?: FindParams<CONFIG, LOCALES, DOC, SELECT>) => Promise<FindResult<DOC>>;
    findById: (params: FindByIdParams<CONFIG, LOCALES, DOC, SELECT>) => Promise<DOC>;
    count: (params: CountParams<DOC>) => Promise<CountResult>;
    create: (params: CreateParams<LOCALES, DOC>) => Promise<CreateResult<DOC>>;
    createDraft: (params: CreateDraftParams<LOCALES, DOC>) => Promise<CreateDraftResult<DOC>>;
    update: (params: UpdateParams<LOCALES, DOC>) => Promise<UpdateResult<DOC>>;
    updateById: (params: UpdateByIdParams<LOCALES, DOC>) => Promise<UpdateByIdResult<DOC>>;
    delete: (params?: DeleteParams<LOCALES, DOC>) => Promise<DeleteResult<DOC>>;
    deleteById: (params: DeleteByIdParams<LOCALES>) => Promise<DOC>;
};

export type CollectionsWithAuthApi<CONFIG extends Config, LOCALES, DOC extends Doc, SELECT> = CollectionsApi<CONFIG, LOCALES, DOC, SELECT> & {
    login: (params: LoginParams) => Promise<LoginResult<DOC>>;
    logout: (params: LogoutParams) => Promise<LogoutResult>;
    unlock: (params: UnlockParams) => Promise<UnlockResult>;
    "refresh-token": (params: RefreshTokenParams) => Promise<RefreshTokenResult>;
    // verify
    me: (params: MeParams) => Promise<MeResult<DOC>>;
    "forgot-password": (params: ForgotPasswordParams) => Promise<ForgotPasswordResult>;
    "reset-password": (params: ResetPasswordParams) => Promise<ResetPasswordResult<DOC>>;
};

export type GlobalsApi<LOCALES, GLOBAL> = {
    get: (params?: BaseParams<LOCALES>) => Promise<GLOBAL>;
    update: (params: UpdateGlobalParams<LOCALES, GLOBAL>) => Promise<GLOBAL>;
};

export type RPC<CONFIG extends Config, LOCALES> = {
    collections: {
        [P in keyof Collections<CONFIG>]: Collections<CONFIG>[P] extends DocWithAuth
        ? CollectionsWithAuthApi<CONFIG, LOCALES, Collections<CONFIG>[P], CollectionsSelect<CONFIG>[P]>
        : CollectionsApi<CONFIG, LOCALES, Collections<CONFIG>[P], CollectionsSelect<CONFIG>[P]>;
    };
    globals: {
        [P in keyof Globals<CONFIG>]: GlobalsApi<LOCALES, Globals<CONFIG>[P]>;
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

export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
export type ExtractJoin<T extends { docs: any[]; }> = Exclude<T["docs"][number], string | number>;

export type JoinParams<DOC extends Doc> = {
    sort?: keyof DOC extends string ? keyof DOC | `-${keyof DOC}` : never;
    where?: Filter<DOC>;
    limit?: number;
};

export type BaseParams<LOCALES> = {
    depth?: number;
    locale?: LOCALES;
    fallbackLocale?: LOCALES | "null" | "false" | "none";
    [p: string]: any;
};

export type FindParams<CONFIG extends Config, LOCALES, DOC extends Doc, SELECT> = BaseParams<LOCALES> & {
    sort?: keyof DOC extends string ? keyof DOC | `-${keyof DOC}` : never;
    where?: Filter<DOC>;
    limit?: number;
    page?: number;
    select?: SELECT;
    populate?: Partial<CollectionsSelect<CONFIG>>;
    joins?: {
        [P in keyof NoUndefinedField<DOC>]?: NoUndefinedField<DOC>[P] extends { docs: any }
        ? JoinParams<ExtractJoin<NoUndefinedField<DOC>[P]>>
        : never;
    };
};

export type FindByIdParams<CONFIG extends Config, LOCALES, DOC extends Doc, SELECT> = BaseParams<LOCALES> & {
    id: DOC["id"];
    select?: SELECT;
    populate?: Partial<CollectionsSelect<CONFIG>>;
    joins?: {
        [P in keyof NoUndefinedField<DOC>]?: NoUndefinedField<DOC>[P] extends { docs: any }
        ? JoinParams<ExtractJoin<NoUndefinedField<DOC>[P]>>
        : never;
    };
};

export type FindResult<DOC extends Doc> = {
    docs: DOC[];
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

export type CountParams<DOC extends Doc> = {
    where?: Filter<DOC>;
    [p: string]: any;
};

export type CountResult = {
    totalDocs: number;
};

export type CreateParams<LOCALES, DOC extends Doc> = BaseParams<LOCALES> & {
    draft?: false,
    doc: Omit<DOC, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
        createdAt?: string;
        updatedAt?: string;
    };
};

export type CreateResult<DOC extends Doc> = {
    message: string;
    doc: DOC;
};

export type CreateDraftParams<LOCALES, DOC extends Doc> = BaseParams<LOCALES> & {
    doc: Partial<CreateParams<LOCALES, DOC>["doc"]>;
};

export type CreateDraftResult<DOC extends Doc> = {
    message: string;
    doc: Partial<DOC>;
};

export type UpdateParams<LOCALES, DOC extends Doc> = BaseParams<LOCALES> & {
    patch: Partial<DOC>;
    where?: Filter<DOC>;
};

export type UpdateResult<DOC extends Doc> = {
    docs: DOC[];
    errors: string[];
};

export type UpdateByIdParams<LOCALES, DOC extends Doc> = BaseParams<LOCALES> & {
    id: string;
    patch: Partial<DOC>;
};

export type UpdateGlobalParams<LOCALES, GLOBAL> = BaseParams<LOCALES> & {
    patch: Partial<GLOBAL>;
};

export type UpdateByIdResult<DOC extends Doc> = {
    message: string;
    doc: DOC;
};

export type DeleteParams<LOCALES, DOC extends Doc> = BaseParams<LOCALES> & {
    where?: Filter<DOC>;
};

export type DeleteByIdParams<LOCALES> = BaseParams<LOCALES> & {
    id: string;
};

export type DeleteResult<DOC extends Doc> = {
    docs: DOC[];
    errors: string[];
};

export type LoginParams = {
    email: string;
    password: string;
};

export type LoginResult<DOC extends Doc> = {
    message: string;
    user: DOC;
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

export type MeResult<DOC extends Doc> = {
    collection: string;
    user: DOC & { _strategy: string };
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

export type ResetPasswordResult<DOC extends Doc> = {
    message: string;
    user: DOC;
    token: string;
};
