import { fetchFactory } from "./fetch";
import { FetchOptions } from "./types";

export const createAccessApi = (options: FetchOptions) => {
    const fetchFn = fetchFactory(options);

    return () => fetchFn({
        method: "GET",
        url: ["access"],
        qs: null,
    });
};
