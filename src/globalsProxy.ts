import { fetchFactory } from "./fetch";
import { createQueryString } from "./qs";
import { ClientOptions, GlobalsApi } from "./types";

export const createGlobalsProxy = (options: ClientOptions) => {
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
                            path: ["globals", slug],
                            qs: createQueryString(params),
                        });
                    },
                    update: (params) => {
                        const { patch, ...rest } = params;

                        return fetchFn({
                            type: "global",
                            slug,
                            method: "POST",
                            path: ["globals", slug],
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

