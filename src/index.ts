import { createAccessApi } from "./accessApi";
import { createCollectionsProxy } from "./collectionsProxy";
import { createGlobalsProxy } from "./globalsProxy";
import { Config, FetchOptions, RPC } from "./types";

export * from "./errors";

export const createClient = <T extends Config, LOCALES>(options: FetchOptions) => ({
    collections: createCollectionsProxy(options),
    globals: createGlobalsProxy(options),
    access: createAccessApi(options),
}) as RPC<T, LOCALES>;
