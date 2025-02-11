import { ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";
import { FetchOptions } from "./types";

type FetchParams = {
    type?: "collection" | "global";
    slug?: string;
    method: "GET" | "POST" | "PATCH" | "DELETE";
    url: string[];
    qs: string | null;
    body?: any;
};

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

export const fetchFactory = (options: FetchOptions) => async (params: FetchParams) => {
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
