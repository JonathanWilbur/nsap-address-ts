//! ISO/IEC 646 character encoding per ITU-T Rec. X.213, Section A.5.3.e
//!
//! Quoting ITU-T Rec. X.213, Section A.5.3.e:
//!
//! > when the IDI format is "Local", representing an ISO/IEC 646 character
//! > syntax DSP by converting each character to a number in the range 32-127
//! > using the ISO/IEC 646 encoding, with zero parity and the parity bit in
//! > the most significant position, reducing the value by 32, giving a number
//! > in the range 0-95, encoding this result as a pair of decimal digits, and
//! > using a semi-octet to represent the value of each decimal digit, yielding
//! > a value in the range 0000-1001 for each digit;
//!
//! This just might be the dumbest way to encode characters I've ever heard of.

/// Convert an ISO/IEC 646 byte encoded per ITU-T Rec. X.213 to a UTF-8 `char`
///
/// Returns an `Err` if the byte does not encode a permitted character.
/// Permitted characters are those from ASCII code points 32 to 127, inclusively.
export function local_iso_iec_646_byte_to_char(b: number): number | null {
    const ones = b & 0x0F;
    const tens = (b & 0xF0) >> 4;
    if (ones > 9 || tens > 9) {
        return null;
    }
    const cc: number = (tens * 10) + ones;
    // Out of precaution, this library additionally prohibits code point 127
    // (`ESC`). This is a control character, and I think it was the ITU's
    // intention to forbid this character from the encoding as well.
    if (cc >= 95) {
        return null;
    }
    return (cc + 32);
}

/// Convert a UTF-8 `char` to an ISO/IEC 646 byte per ITU-T Rec. X.213
///
/// Returns an `Err` if the `char` is not a permitted character.
/// Permitted characters are those from ASCII code points 32 to 127, inclusively.
///
/// Out of precaution, this library additionally prohibits code point 127
/// (`ESC`). This is a control character, and I think it was the ITU's
/// intention to forbid this character from the encoding as well.
export function char_to_local_iso_iec_646_byte(c: number): number | null {
    if (c < 0x20 || c > 0x7E) {
        return null;
    }
    let cc = c - 32;
    let ones: number = cc % 10;
    let tens: number = cc / 10;
    let b: number = (tens << 4) + ones;
    return b;
}
