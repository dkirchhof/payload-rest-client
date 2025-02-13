import { createAccessApi } from "./accessApi";
import { createCollectionsProxy } from "./collectionsProxy";
import { createGlobalsProxy } from "./globalsProxy";
import { CustomEndpoints, createCustomEndpoints } from "./customEndpoints";
import { Config, ClientOptions, RPC } from "./types";

export { CustomEndpoint } from "./customEndpoints";
export * from "./errors";

export const createClient = <
    T extends Config,
    LOCALES,
    CE extends CustomEndpoints = any,
>(options: ClientOptions<CE>) => ({
    collections: createCollectionsProxy(options),
    globals: createGlobalsProxy(options),
    access: createAccessApi(options),
    custom: createCustomEndpoints(options),
}) as RPC<T, LOCALES, CE>;
