import { fetchFactory } from "./fetch";
import { ClientOptions } from "./types";

export const createAccessApi = (options: ClientOptions) => {
    const fetchFn = fetchFactory(options);

    return () => fetchFn({
        method: "GET",
        path: ["access"],
        qs: null,
    });
};
