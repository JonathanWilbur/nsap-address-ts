/** Convert a u8 to decimal ASCII digits */
export function u8_to_decimal_bytes(n: number): Uint8Array {
    let hundreds = n / 100;
    n %= 100;
    let tens = n / 10;
    let ones = n % 10;
    return new Uint8Array([
        0x30 + hundreds,
        0x30 + tens,
        0x30 + ones,
    ]);
}

/** Convert a u16 to decimal ASCII digits */
export function u16_to_decimal_bytes(n: number): Uint8Array {
    let ten_thousands = (n / 10000);
    n %= 10000;
    let thousands = (n / 1000);
    n %= 1000;
    let hundreds = (n / 100);
    n %= 100;
    let tens = (n / 10);
    let ones = (n % 10);
    return new Uint8Array([
        0x30 + ten_thousands,
        0x30 + thousands,
        0x30 + hundreds,
        0x30 + tens,
        0x30 + ones,
    ]);
}

/**
 * @summary Compare two Uint8Arrays
 * @description
 * 
 * It is absolutely fucking inexcusable that JavaScript does not have a
 * built-in for this. Just when I think Javascript is actually a decent
 * language, I am reminded of things like this.
 * 
 * @param a The first Uint8Array to compare.
 * @param b The second Uint8Array to compare.
 * @returns `true` if the two Uint8Arrays are equal, `false` otherwise.
 * @function
 */
export function uint8ArrayCompare(
    a: Uint8Array,
    b: Uint8Array
): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
