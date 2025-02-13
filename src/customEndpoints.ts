import { FetchMethod, fetchFactory } from "./fetch";
import { createQueryString } from "./qs";
import { ClientOptions } from "./types";

export type CEInput<
    P = Record<string, string>,
    Q = Record<string, any>,
    B = any,
> = {
    params?: P;
    query?: Q;
    body?: B;
};

export type CustomEndpoint<Input extends CEInput, Output> = (input: Input) => Promise<Output>;
export type CustomEndpoints = Record<string, CustomEndpoint<any, any>>;

export type CustomEndpointFactory<Params> = {
    method: FetchMethod;
    path: (params: Params) => string;
};

export type CustomEndpointFactories = Record<string, CustomEndpointFactory<any>>;

export type CE_To_CEFactory<T> = {
    [P in keyof T]: T[P] extends CustomEndpoint<infer I, any>
        ? CustomEndpointFactory<I["params"]>
        : never;
};

export const createCustomEndpoints = (options: ClientOptions) => {
    if (!options.customEndpoints) {
        return undefined;
    }

    const fetch = fetchFactory(options);

    return Object.entries(options.customEndpoints).reduce((ce, [name, factory]) => ({
        ...ce,
        [name]: (input: CEInput) => {
            const path = factory.path(input.params);

            return fetch({
                method: factory.method,
                path,
                qs: createQueryString(input.query),
                body: input.body,
            });
        },
    }), {}) as CustomEndpoints;
};
