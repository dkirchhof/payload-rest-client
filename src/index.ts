import { ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";
import { createQueryString } from "./qs";
import { CollectionsApi, Config, FetchOptions, GlobalsApi, RPC } from "./types";

const parseData = async (res: Response): Promise<{ data: any; asText: string; }> => {
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

const fetchFactory = (options: FetchOptions) => async (method: "GET" | "POST" | "PATCH" | "DELETE", url: string[], qs: string | null, body?: any) => {
    const qsString = qs ? `?${qs}` : "";
    const fullUrl = `${options.apiUrl}/${url.join("/")}${qsString}`;

    const res = await fetch(fullUrl, {
        method,
        cache: options.cache,
        headers: {
            ...options.headers,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await parseData(res);

    if (options.debug) {
        console.log(`${method}: ${fullUrl} => ${res.status}`);
    }

    if (!res.ok) {
        switch (res.status) {
            case 401: throw new UnauthorizedError(data.asText);
            case 403: throw new ForbiddenError(data.asText);
            case 404: throw new NotFoundError(data.asText);
            default: throw new Error(data.asText);
        }
    }

    return data.data;
};

const createCollectionsProxy = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return new Proxy({}, {
        get: (_, slug: string) => {
            const api: CollectionsApi<any, any> = {
                find: params => {
                    return fetchFn("GET", [slug], createQueryString(params));
                },
                findById: params => {
                    const { id, ...rest } = params;

                    return fetchFn("GET", [slug, id], createQueryString(rest));
                },
                create: params => {
                    const { doc, ...rest } = params;

                    return fetchFn("POST", [slug], createQueryString(rest), doc);
                },
                update: params => {
                    const { patch, ...rest } = params;

                    return fetchFn("PATCH", [slug], createQueryString(rest));
                },
                updateById: params => {
                    const { id, patch, ...rest } = params;

                    return fetchFn("PATCH", [slug, id], createQueryString(rest), patch);
                },
                delete: params => {
                    return fetchFn("DELETE", [slug], createQueryString(params));
                },
                deleteById: params => {
                    const { id, ...rest } = params;

                    return fetchFn("DELETE", [slug, id], createQueryString(rest));
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
                    return fetchFn("GET", ["globals", slug], createQueryString(params));
                },
                update: params => {
                    const { patch, ...rest } = params;

                    return fetchFn("GET", ["globals", slug], createQueryString(rest));
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
