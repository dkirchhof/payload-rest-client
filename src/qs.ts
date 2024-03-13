export const createQueryString = (params: Object | undefined) => {
    if (!params) {
        return "";
    }

    const encodeQuery = (key: string, value: any) => {
        // return `${key}=${encodeURIComponent(value)}`;
        return `${key}=${value}`;
    };

    const buildQueryString = (obj: Object, parentKey: string) => {
        const parts: string[] = Object.entries(obj).map(([key, value]) => {
            const currentKey = parentKey ? `${parentKey}[${key}]` : key;

            if (value instanceof Date) {
                return encodeQuery(currentKey, value.toISOString());
            }

            if (typeof value === "object") {
                return buildQueryString(value, currentKey);
            }

            return encodeQuery(currentKey, value);
        });

        return parts.join("&");
    };

    return buildQueryString(params, "");
};
