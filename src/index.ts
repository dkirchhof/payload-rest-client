import { ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";
import { createQueryString } from "./qs";
import { CollectionsWithAuthApi, Config, FetchOptions, GlobalsApi, RPC } from "./types";

export * from "./errors";

const parseData = async (res: Response): Promise<{ data: any; asText: string }> => {
    if (res.headers.get("content-type")?.startsWith("application/json")) {
        const json = await res.json();
        const asText = JSON.stringify(json);

        return { data: json, asText };
    } else {
        const text = await res.text();
        const asText = text;

        return { data: text, asText };
    }
};

type FetchParams = {
    type?: "collection" | "global";
    slug?: string;
    method: "GET" | "POST" | "PATCH" | "DELETE";
    url: string[];
    qs: string | null;
    body?: any;
};

const fetchFactory = (options: FetchOptions) => async (params: FetchParams) => {
    const qsString = params.qs ? `?${params.qs}` : "";
    const fullUrl = `${options.apiUrl}/${params.url.join("/")}${qsString}`;

    const additionalFetchOptions = options.getAdditionalFetchOptions?.({
        type: params.type,
        slug: params.slug,
        method: params.method,
        url: fullUrl,
    });

    const fetchFn = options.customFetchFn || fetch;

    const res = await fetchFn(fullUrl, {
        method: params.method,
        cache: options.cache,
        headers: {
            ...options.headers,
            "Content-Type": "application/json",
        },
        body: params.body && JSON.stringify(params.body),
        ...additionalFetchOptions,
    });

    const data = await parseData(res);

    if (options.debug) {
        console.log(`type: ${params.type}`);
        console.log(`slug: ${params.slug}`);
        console.log(`additionalFetchOptions: ${JSON.stringify(additionalFetchOptions)}`);
        console.log(`request: ${params.method} ${fullUrl} => ${res.status}`);
    }

    if (!res.ok) {
        switch (res.status) {
            case 401:
                throw new UnauthorizedError(data.asText);
            case 403:
                throw new ForbiddenError(data.asText);
            case 404:
                throw new NotFoundError(data.asText);
            default:
                throw new Error(data.asText);
        }
    }

    return data.data;
};

const createCollectionsProxy = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return new Proxy(
        {},
        {
            get: (_, slug: string) => {
                const api: CollectionsWithAuthApi<any, any, any, any, any> = {
                    find: (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "GET",
                            url: [slug],
                            qs: createQueryString(params),
                        });
                    },
                    findById: (params) => {
                        const { id, ...rest } = params;

                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "GET",
                            url: [slug, id],
                            qs: createQueryString(rest),
                        });
                    },
                    count: (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "GET",
                            url: [slug, "count"],
                            qs: createQueryString(params),
                        });
                    },
                    create: (params) => {
                        const { doc, ...rest } = params;

                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug],
                            qs: createQueryString(rest),
                            body: doc,
                        });
                    },
                    createDraft: (params) => {
                        const { doc, ...rest } = params;

                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug],
                            qs: createQueryString({
                                ...rest,
                                draft: true,
                            }),
                            body: doc,
                        });
                    },
                    update: (params) => {
                        const { patch, ...rest } = params;

                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "PATCH",
                            url: [slug],
                            qs: createQueryString(rest),
                            body: patch,
                        });
                    },
                    updateById: (params) => {
                        const { id, patch, ...rest } = params;

                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "PATCH",
                            url: [slug, id],
                            qs: createQueryString(rest),
                            body: patch,
                        });
                    },
                    delete: (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "DELETE",
                            url: [slug],
                            qs: createQueryString(params),
                        });
                    },
                    deleteById: (params) => {
                        const { id, ...rest } = params;

                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "DELETE",
                            url: [slug, id],
                            qs: createQueryString(rest),
                        });
                    },

                    login: (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug, "login"],
                            qs: "",
                            body: params,
                        });
                    },
                    logout: (_params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug, "logout"],
                            qs: "",
                        });
                    },
                    unlock: (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug, "unlock"],
                            qs: "",
                            body: params,
                        });
                    },
                    "refresh-token": (_params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug, "refresh-token"],
                            qs: "",
                        });
                    },
                    me: (_params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "GET",
                            url: [slug, "me"],
                            qs: "",
                        });
                    },
                    "forgot-password": (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug, "forgot-password"],
                            qs: "",
                            body: params,
                        });
                    },
                    "reset-password": (params) => {
                        return fetchFn({
                            type: "collection",
                            slug,
                            method: "POST",
                            url: [slug, "reset-password"],
                            qs: "",
                            body: params,
                        });
                    },
                };

                return api;
            },
        }
    );
};

const createGlobalsProxy = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return new Proxy(
        {},
        {
            get: (_, slug: string) => {
                const api: GlobalsApi<any, any> = {
                    get: (params) => {
                        return fetchFn({
                            type: "global",
                            slug,
                            method: "GET",
                            url: ["globals", slug],
                            qs: createQueryString(params),
                        });
                    },
                    update: (params) => {
                        const { patch, ...rest } = params;

                        return fetchFn({
                            type: "global",
                            slug,
                            method: "POST",
                            url: ["globals", slug],
                            qs: createQueryString(rest),
                            body: patch,
                        });
                    },
                };

                return api;
            },
        }
    );
};

const createAccessApi = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return () => fetchFn({
        method: "GET",
        url: ["access"],
        qs: null,
    });
};

export const createClient = <T extends Config, LOCALES>(options: FetchOptions) => ({
    collections: createCollectionsProxy(options),
    globals: createGlobalsProxy(options),
    access: createAccessApi(options),
}) as RPC<T, LOCALES>;
