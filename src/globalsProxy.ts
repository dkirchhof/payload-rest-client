import { fetchFactory } from "./fetch";
import { createQueryString } from "./qs";
import { FetchOptions, GlobalsApi } from "./types";

export const createGlobalsProxy = (options: FetchOptions) => {
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

