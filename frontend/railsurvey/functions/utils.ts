const DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
const PROPERIZE_REGEXP = /\w\S*/g;

export function decamelize(str: string) {
    return str.replace(DECAMELIZE_REGEXP, "$1 $2");
}

export function titleCase(str: string) {
    return str.replace(
        PROPERIZE_REGEXP,
        (text: string) =>
            text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

export const toNumber = (
    value: string | string[] | undefined,
    fallback: number = 0
): number => {
    if (Array.isArray(value)) {
        return Number(value[0]) || fallback;
    }
    return value !== undefined ? Number(value) || fallback : fallback;
};
