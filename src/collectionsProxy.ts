import { fetchFactory } from "./fetch";
import { createQueryString } from "./qs";
import { CollectionsWithAuthApi, FetchOptions } from "./types";

export const createCollectionsProxy = (options: FetchOptions) => {
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
