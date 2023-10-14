import { stringify } from "qs";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";
import { BaseParams, CollectionsApi, Config, FetchOptions, GlobalsApi, RPC } from "./types";

const createQS = (params?: BaseParams<any>) => stringify(params, { encode: false });

const fetchFactory = (options: FetchOptions) => async (method: "GET" | "POST" | "PATCH" | "DELETE", url: string[], qs: string | null, body?: any) => {
    const qsString = qs ? `?${qs}` : "";
    const fullUrl = `${options.apiUrl}/${url.join("/")}${qsString}`;

    // console.log(method, fullUrl, body);

    const res = await fetch(fullUrl, {
        method,
        cache: options.cache,
        headers: {
            ...options.headers,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const json =  await res.json();

    if (!res.ok) {
        switch (res.status) {
            case 401: throw new UnauthorizedError(JSON.stringify(json));
            case 403: throw new ForbiddenError(JSON.stringify(json));
            case 404: throw new NotFoundError(JSON.stringify(json));
            default: throw new Error(JSON.stringify(json));
        }
    }

    return json;
};

const createCollectionsProxy = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return new Proxy({}, {
        get: (_, slug: string) => {
            const api: CollectionsApi<any, any> = {
                find: params => {
                    return fetchFn("GET", [slug], createQS(params));
                },
                findById: params => {
                    const { id, ...rest } = params;

                    return fetchFn("GET", [slug, id], createQS(rest));
                },
                create: params => {
                    const { doc, ...rest } = params;

                    return fetchFn("POST", [slug], createQS(rest), doc);
                },
                update: params => {
                    const { patch, ...rest } = params;

                    return fetchFn("PATCH", [slug], createQS(rest));
                },
                updateById: params => {
                    const { id, patch, ...rest } = params;

                    return fetchFn("PATCH", [slug, id], createQS(rest), patch);
                },
                delete: params => {
                    return fetchFn("DELETE", [slug], createQS(params));
                },
                deleteById: params => {
                    const { id, ...rest } = params;

                    return fetchFn("DELETE", [slug, id], createQS(rest));
                },
            };

            return api;
        },
    });
};

const createGlobalsProxy = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return new Proxy({}, {
        get: (_, slug: string) => {
            const api: GlobalsApi<any, any> = {
                get: params => {
                    return fetchFn("GET", [slug], createQS(params));
                },
                update: params => {
                    const { patch, ...rest } = params;

                    return fetchFn("GET", [slug], createQS(rest));
                },
            };

            return api;
        },
    });
};
export const createClient = <T extends Config, LOCALES>(options: FetchOptions) => ({
    collections: createCollectionsProxy(options),
    globals: createGlobalsProxy(options),
}) as RPC<T, LOCALES>;
