import { type AFI, type DSPSyntax, X213NetworkAddress, type Ipv4Address } from "./types.mjs";
import {
    ECMA_117_DECIMAL_STR, X25_PREFIX_STR,
    AFI_E163_BIN_LEADING_NON_ZERO, AFI_E163_BIN_LEADING_ZERO, AFI_E163_DEC_LEADING_NON_ZERO,
    AFI_E163_DEC_LEADING_ZERO, AFI_E164_BIN_LEADING_NON_ZERO, AFI_E164_BIN_LEADING_ZERO,
    AFI_E164_DEC_LEADING_NON_ZERO, AFI_E164_DEC_LEADING_ZERO, AFI_F69_BIN_LEADING_NON_ZERO,
    AFI_F69_BIN_LEADING_ZERO, AFI_F69_DEC_LEADING_NON_ZERO, AFI_F69_DEC_LEADING_ZERO,
    AFI_ISO_6523_ICD_BIN, AFI_ISO_6523_ICD_DEC, AFI_ISO_DCC_BIN, AFI_ISO_DCC_DEC, AFI_LOCAL_BIN,
    AFI_LOCAL_DEC, AFI_LOCAL_ISO_IEC_646, AFI_LOCAL_NATIONAL, AFI_URL,
    AFI_X121_BIN_LEADING_NON_ZERO, AFI_X121_BIN_LEADING_ZERO, AFI_X121_DEC_LEADING_NON_ZERO,
    AFI_X121_DEC_LEADING_ZERO, ECMA_117_BINARY_STR, IETF_RFC_1006_PREFIX_STR,
    get_nsap_address_schema,
    AFI_IANA_ICP_BIN, AFI_IANA_ICP_DEC, AFI_ITU_T_IND_BIN, AFI_ITU_T_IND_DEC, AFI_STR_URL,
    IPV4_STR, IPV6_STR,
    AFI_STR_X121, AFI_STR_DCC, AFI_STR_TELEX, AFI_STR_PSTN, AFI_STR_ISDN, AFI_STR_ICD, AFI_STR_ICP, AFI_STR_IND, AFI_STR_LOCAL,
} from "./data.mjs";
import { u8_to_decimal_bytes, u16_to_decimal_bytes } from "./utils.mjs";
import type { NSAPAddressParseError } from "./error.mjs";
import { char_to_local_iso_iec_646_byte } from "./isoiec646.mjs";
import { BCDBuffer } from "./bcd.mjs";

/**
 * Result of parsing a string, or part of it, into an NSAP address
 */
export type ParseResult = X213NetworkAddress | NSAPAddressParseError;

/** Validate that string is a hexadecimal string and shorter than `max_len` */
function validate_hexstring(s: string, max_len: number): boolean {
    return (
        (s.length <= max_len)
        && (/^[0-9a-fA-F]+$/.test(s))
    );
}

/** Convert a hexadecimal string to a Uint8Array */
function fromHex(hex: string): Uint8Array {
    if (typeof Uint8Array.fromHex === "function") {
        return Uint8Array.fromHex(hex);
    }
    const result = new Uint8Array(hex.length / 2);
    // This code can be removed in a few years once fromHex is widely supported.
    for (let i = 0; i < result.length; i++) {
        const j = i << 1;
        const pair = hex.slice(j, j + 2).padEnd(2, '0');
        if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
            throw new SyntaxError("Invalid hexadecimal string");
        }
        result[i] = Number.parseInt(pair, 16);
    }
    return result;
}

// This function was written by Cursor IDE's AI / LLM.
// Only the newest Javascript has built-in hex decoding without Buffer.
const hexCharToValue = (code: number): number => {
    if (code >= 0x30 && code <= 0x39) return code - 0x30; // '0'-'9'
    if (code >= 0x41 && code <= 0x46) return code - 0x41 + 10; // 'A'-'F'
    if (code >= 0x61 && code <= 0x66) return code - 0x61 + 10; // 'a'-'f'
    return -1; // Invalid hex char
};

/** Decode an AFI from a `str` */
function decode_afi_from_str(s: string): number | null {
    if (s.length !== 2) {
        return null;
    }
    const high = hexCharToValue(s.charCodeAt(0));
    const low = hexCharToValue(s.charCodeAt(1));
    if (high === -1 || low === -1) return null;
    return (high << 4) | low;
}

/*
Every valid NSAP string has a second part... except per ITU-T Rec.
X.213, section A.7, which handles a zero-length DSP.

Note: there seems to be an error in RFC 1278 in making the
second <hexstring> non-optional, since this is optional in X.213.
X.213 also says that the first byte of the <idp> may be hex,
which RFC 1278 does not permit.
*/
function decode_idp_only(s: string): X213NetworkAddress | NSAPAddressParseError {
    if (!/\d+/.test(s.slice(2))) {
        return "malformed";
    }
    const afi = decode_afi_from_str(s.slice(0, 2));
    if (afi === null) {
        return "malformed";
    }
    // If the schema is not known, we cannot construct an NSAP,
    // because we don't know how long the IDI is.
    const schema = get_nsap_address_schema(afi);
    if (!schema) {
        return "unrecognized_afi";
    }
    const idi_len_digits = schema.max_idi_len_digits;
    const bcd_buf = new BCDBuffer();
    bcd_buf.push_byte(afi);
    const idi_pad = schema.leading_zeroes_in_idi ? 1 : 0;
    let idi_deficit = Math.max(idi_len_digits - (s.length - 2), 0);
    while (idi_deficit > 0) {
        bcd_buf.push_nybble(idi_pad);
        idi_deficit -= 1;
    }
    bcd_buf.push_str(s.slice(2));
    if ((bcd_buf.i % 2) > 0) {
        bcd_buf.push_nybble(0xF);
    }
    return new X213NetworkAddress(bcd_buf.as_ref());
}

function naddr_str_key(afi: string, dsp_syntax: DSPSyntax, leading0: boolean): string {
    return `${afi}:${dsp_syntax}:${leading0}`;
}

const naddr_str_to_afi_map = new Map<string, AFI>([
    [ (naddr_str_key(AFI_STR_X121, "decimal", false)), AFI_X121_DEC_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_X121, "decimal", true)), AFI_X121_DEC_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_X121, "binary", false)), AFI_X121_BIN_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_X121, "binary", true)), AFI_X121_BIN_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_DCC, "decimal", false)), AFI_ISO_DCC_DEC ],
    [ (naddr_str_key(AFI_STR_DCC, "decimal", true)), AFI_ISO_DCC_DEC ],
    [ (naddr_str_key(AFI_STR_DCC, "binary", false)), AFI_ISO_DCC_BIN ],
    [ (naddr_str_key(AFI_STR_DCC, "binary", true)), AFI_ISO_DCC_BIN ],
    [ (naddr_str_key(AFI_STR_TELEX, "decimal", false)), AFI_F69_DEC_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_TELEX, "decimal", true)), AFI_F69_DEC_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_TELEX, "binary", false)), AFI_F69_BIN_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_TELEX, "binary", true)), AFI_F69_BIN_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_PSTN, "decimal", false)), AFI_E163_DEC_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_PSTN, "decimal", true)), AFI_E163_DEC_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_PSTN, "binary", false)), AFI_E163_BIN_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_PSTN, "binary", true)), AFI_E163_BIN_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_ISDN, "decimal", false)), AFI_E164_DEC_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_ISDN, "decimal", true)), AFI_E164_DEC_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_ISDN, "binary", false)), AFI_E164_BIN_LEADING_NON_ZERO ],
    [ (naddr_str_key(AFI_STR_ISDN, "binary", true)), AFI_E164_BIN_LEADING_ZERO ],
    [ (naddr_str_key(AFI_STR_ICD, "decimal", false)), AFI_ISO_6523_ICD_DEC ],
    [ (naddr_str_key(AFI_STR_ICD, "decimal", true)), AFI_ISO_6523_ICD_DEC ],
    [ (naddr_str_key(AFI_STR_ICD, "binary", false)), AFI_ISO_6523_ICD_BIN ],
    [ (naddr_str_key(AFI_STR_ICD, "binary", true)), AFI_ISO_6523_ICD_BIN ],
    [ (naddr_str_key(AFI_STR_ICP, "decimal", false)), AFI_IANA_ICP_DEC ],
    [ (naddr_str_key(AFI_STR_ICP, "decimal", true)), AFI_IANA_ICP_DEC ],
    [ (naddr_str_key(AFI_STR_ICP, "binary", false)), AFI_IANA_ICP_BIN ],
    [ (naddr_str_key(AFI_STR_ICP, "binary", true)), AFI_IANA_ICP_BIN ],
    [ (naddr_str_key(AFI_STR_IND, "decimal", false)), AFI_ITU_T_IND_DEC ],
    [ (naddr_str_key(AFI_STR_IND, "decimal", true)), AFI_ITU_T_IND_DEC ],
    [ (naddr_str_key(AFI_STR_IND, "binary", false)), AFI_ITU_T_IND_BIN ],
    [ (naddr_str_key(AFI_STR_IND, "binary", true)), AFI_ITU_T_IND_BIN ],
    [ (naddr_str_key(AFI_STR_LOCAL, "decimal", false)), AFI_LOCAL_DEC ],
    [ (naddr_str_key(AFI_STR_LOCAL, "decimal", true)), AFI_LOCAL_DEC ],
    [ (naddr_str_key(AFI_STR_LOCAL, "binary", false)), AFI_LOCAL_BIN ],
    [ (naddr_str_key(AFI_STR_LOCAL, "binary", true)), AFI_LOCAL_BIN ],
    [ (naddr_str_key(AFI_STR_LOCAL, "iso646", false)), AFI_LOCAL_ISO_IEC_646 ],
    [ (naddr_str_key(AFI_STR_LOCAL, "iso646", true)), AFI_LOCAL_ISO_IEC_646 ],
    [ (naddr_str_key(AFI_STR_LOCAL, "national", false)), AFI_LOCAL_NATIONAL ],
    [ (naddr_str_key(AFI_STR_LOCAL, "national", true)), AFI_LOCAL_NATIONAL ],
]);

/** Translate an AFI string, such as "X121" to an AFI value */
function naddr_str_to_afi(
    s: string,
    leading0: boolean,
    dsp_syntax: DSPSyntax,
    standard_only: boolean = false,
): AFI | undefined {
    if (s === AFI_STR_URL) {
        return AFI_URL;
    }
    if (
        standard_only
        && (
            (s === AFI_STR_ICP)
            || (s === AFI_STR_IND)
        )
    ) {
        return undefined;
    }
    return naddr_str_to_afi_map.get(naddr_str_key(s, dsp_syntax, leading0));
}

function parse_url(idi: string, url: string): ParseResult {
    /* The URL cannot contain underscores only because RFC 1278 uses
    underscores to separate NSAP addresses in a presentation address. */
    if (url.includes('_')) {
        return "prohibited_character";
    }
    const bcd_buf = new BCDBuffer();
    bcd_buf.push_byte(AFI_URL);
    let idi_deficit = Math.max(4 - idi.length, 0);
    while (idi_deficit > 0) {
        bcd_buf.push_nybble(0);
        idi_deficit -= 1;
    }
    bcd_buf.push_str(idi);
    const out = new Uint8Array([
        ...bcd_buf.as_ref(),
        ...new TextEncoder().encode(url),
    ]);
    return new X213NetworkAddress(out);
}

/** Parse the part that comes after "NS+" */
function parse_ns_dsp(ns: string): ParseResult {
    return new X213NetworkAddress(fromHex(ns));
}

function parse_decimal_dsp(bcd_buf: BCDBuffer, dsp: string): ParseResult {
    if (!/^[0-9]+$/.test(dsp.slice(1))) {
        return "malformed";
    }
    bcd_buf.push_str(dsp.slice(1));
    if ((bcd_buf.i % 2) > 0) {
        bcd_buf.push_nybble(0x0F);
    }
    return new X213NetworkAddress(bcd_buf.as_ref());
}

function parse_hexadecimal_dsp(idp: BCDBuffer, dsp: string): ParseResult {
    const out = new Uint8Array([
        ...idp.as_ref(),
        ...fromHex(dsp.slice(1)),
    ]);
    return new X213NetworkAddress(out);
}

function parse_textual_dsp(idp: BCDBuffer, dsp: string): ParseResult {
    if (!/^[0-9a-zA-Z+-.]+$/.test(dsp)) {
        return "malformed";
    }
    const out = new Uint8Array([
        ...idp.as_ref(),
        ...Array.from(dsp.slice(1))
            .map((c) => char_to_local_iso_iec_646_byte(c.charCodeAt(0))!),
    ]);
    return new X213NetworkAddress(out);
}

function parse_idp_and_dsp(idp: string, dsp: string, syntax: DSPSyntax): ParseResult {
    if (idp.length < 2 || !/^[0-9]+$/.test(idp.slice(2))) {
        return "malformed";
    }
    const afi = decode_afi_from_str(idp.slice(0, 2));
    if (typeof afi !== "number") {
        return "malformed";
    }
    const schema = get_nsap_address_schema(afi);
    if (!schema) {
        return "unrecognized_afi";
    }
    const idi_len_digits: number = schema.max_idi_len_digits;
    if ((idi_len_digits % 2) > 0 && syntax == "decimal"){
        /* In the encoding specified in ITU-T Rec. X.213, Section A.7, it
        is not clear how to encode decimal DSPs when the first digit
        occupies the last nybble of the IDP's last octet. It is not clear
        if an odd number of hex characters could be used, or if this
        representation is only suitable for binary DSPs. */
        return "specification_failure";
    }
    const bcd_buf = new BCDBuffer();
    bcd_buf.push_byte(afi);
    const idi_pad = schema.leading_zeroes_in_idi ? 1 : 0;
    let idi_deficit = Math.max(idi_len_digits - (idp.length - 2), 0);
    while (idi_deficit > 0) {
        bcd_buf.push_nybble(idi_pad);
        idi_deficit -= 1;
    }
    bcd_buf.push_str(idp.slice(2));
    if ((bcd_buf.i % 2) > 0) {
        bcd_buf.push_nybble(0xF);
    }
    // FIXME: Is this missing in the Rust version? I think the Rust version only encodes the DSP.
    const out = new Uint8Array([
        ...bcd_buf.as_ref(),
        ...fromHex(dsp),
    ]);
    return new X213NetworkAddress(out);
}

/** Parse an IPv4 address in the standard dotted-decimal notation from a string */
function parse_ipv4(ip: string): Ipv4Address | null {
    const parts = ip.split(".");
    if (parts.length !== 4) {
        return null;
    }
    const numbers = parts.map((part) => Number.parseInt(part, 10));
    for (const num of numbers) {
        if (Number.isNaN(num) || num < 0 || num > 255) {
            return null;
        }
    }
    return numbers as Ipv4Address;
}

// "RFC-1006" "+" <prefix> "+" <ip> [ "+" <port> [ "+" <tset> ]]
function parse_rfc_1006_dsp(
    bcd_buf: BCDBuffer,
    prefix: string,
    ipstr: string,
    portstr?: string,
    tsetstr?: string,
): ParseResult {
    if (prefix.length != 2 || !/^[0-9]+$/.test(prefix)) {
        return "malformed";
    }
    bcd_buf.push_str(prefix);
    const ip = parse_ipv4(ipstr);
    if (!ip) {
        return "malformed";
    }
    if (portstr?.length === 0) {
        return "malformed";
    }
    if (tsetstr?.length === 0) {
        return "malformed";
    }
    const port = portstr
        ? Number.parseInt(portstr, 10)
        : undefined;
    const tset = tsetstr
        ? Number.parseInt(tsetstr, 10)
        : undefined;
    if (Number.isNaN(port) || Number.isNaN(tset)) {
        return "malformed";
    }
    if (port && (port < 0 || port > 65535)) {
        return "malformed";
    }
    if (tset && (tset < 0 || tset > 65535)) {
        return "malformed";
    }
    ip
        .map((o) => u8_to_decimal_bytes(o))
        .forEach((dec_oct) => bcd_buf.push_ascii_bytes(dec_oct));
    if (typeof port === "number") {
        const port_str = u16_to_decimal_bytes(port);
        bcd_buf.push_ascii_bytes(port_str);
    }
    if (typeof tset === "number") {
        const tset_str = u16_to_decimal_bytes(tset);
        bcd_buf.push_ascii_bytes(tset_str);
    }
    return new X213NetworkAddress(bcd_buf.as_ref());
}

// "X.25(80)" "+" <prefix> "+" <dte> [ "+" <cudf-or-pid> "+" <hexstring> ]
function parse_x25_dsp(
    bcd_buf: BCDBuffer,
    prefix: string,
    dte: string,
    cudf_or_pid?: string, // FIXME: Mis-named in Rust crate.
    cudf_or_pid_hex?: string, // FIXME: Mis-named in Rust crate.
): ParseResult {
    if (!/^[0-9]+$/.test(prefix) || !/^[0-9]+$/.test(dte)) {
        return "malformed";
    }
    bcd_buf.push_str(prefix);
    switch (cudf_or_pid) {
        case("PID"): {
            bcd_buf.push_digit_u8(0x31);
            break;
        }
        case("CUDF"): {
            bcd_buf.push_digit_u8(0x32);
            break;
        }
        default: {
            if (typeof cudf_or_pid === "string") {
                return "malformed"; // Any other string is invalid.
            }
            bcd_buf.push_digit_u8(0x30); // DTE-only
        }
    };
    if (typeof cudf_or_pid_hex === "string") {
        const hexstr = cudf_or_pid_hex;
        if ((hexstr.length % 2) > 0 || hexstr.length > 14) {
            // If my calculations are correct, only a
            // 7-byte long CUDF/PID fits in an NSAP addr.
            return "malformed";
        }
        const cudf_or_pid_bytes = fromHex(hexstr);
        // This is the CUDF/PID length field
        bcd_buf.push_digit_u8(cudf_or_pid_bytes.length + 0x30);
        // Then the CUDF/PID itself
        for (const b of cudf_or_pid_bytes.values()) {
            const b_dec = u8_to_decimal_bytes(b);
            bcd_buf.push_ascii_bytes(b_dec);
        }
    }
    let dte_len_bytes = (dte.length >> 1) + (dte.length % 2);
    if (bcd_buf.len_in_bytes() + dte_len_bytes > 20) {
        return "malformed";
    }
    bcd_buf.push_str(dte);
    return new X213NetworkAddress(bcd_buf.as_ref());
}

// "ECMA-117-Binary" "+" <hexstring> "+" <hexstring> "+" <hexstring>
function parse_ecma117_binary_dsp(
    bcd_buf: BCDBuffer,
    d1: string,
    d2: string,
    d3: string,
): ParseResult {
    // See: https://ecma-international.org/wp-content/uploads/ECMA-117_1st_edition_june_1986.pdf
    // Page 7.
    // FIXME: Some of these length checks are missing in Rust crate.
    if (d1.length !== 4 || d2.length > 12 || d3.length !== 2) {
        return "malformed";
    }
    const h1 = fromHex(d1);
    const h2 = fromHex(d2);
    const h3 = fromHex(d3);
    const out = new Uint8Array([
        ...bcd_buf.as_ref(),
        ...h1,
        ...h2,
        ...h3,
    ]);
    return new X213NetworkAddress(out);
}

// "ECMA-117-Decimal" "+" <digitstring> "+" <digitstring> "+" <digitstring>
function parse_ecma117_decimal_dsp(
    bcd_buf: BCDBuffer,
    d1: string,
    d2: string,
    d3: string,
): ParseResult {
    if (
        d1.length != 5
        || d2.length > 15
        || d3.length != 3
        || !/^[0-9]+$/.test(d1)
        || !/^[0-9]*$/.test(d2)
        || !/^[0-9]+$/.test(d3)
    ) {
        return "malformed";
    }
    bcd_buf.push_str(d1);
    bcd_buf.push_str(d2);
    bcd_buf.push_str(d3);
    return new X213NetworkAddress(bcd_buf.as_ref());
}

/**
 * @summary Parse a string into an NSAP address
 * @description
 *
 * This function parses a string into an NSAP address according to the syntax
 * defined in [IETF RFC 1278](https://datatracker.ietf.org/doc/html/rfc1278),
 * but also supporting some modern non-standard syntaxes unless
 * `only_standard` is `true`.
 *
 * @param s The NSAP string to parse.
 * @param only_standard Whether to only parse syntaxes defined in
 *  [IETF RFC 1278](https://datatracker.ietf.org/doc/html/rfc1278).
 * @returns The parsed NSAP address, or an error as a `string` if the string is
 *  not a valid NSAP address.
 * @function
 */
export function parse_nsap(s: string, only_standard: boolean = false): ParseResult {
    // I think this is the shortest possible: NS+0011 or DCC+1+2
    if (s.length < 7) {
        return "malformed";
    }
    const parts = s.split('+');
    const [
        first_part,
        second_part,
        third_part,
        ...rest_parts
    ] = parts;
    if (!first_part || (first_part.length < 2)) {
        return "malformed";
    }
    /* We allow for an empty string here, instead of checking !second_part,
    because IETF RFC 1278 has an error in which the IDI is required to be at
    least one digit for the LOCAL syntax, but the local AFI itself requires
    an empty IDI. */
    if (typeof second_part !== "string") {
        return decode_idp_only(first_part);
    }
    if (first_part == "NS") {
        return parse_ns_dsp(second_part);
    }
    if ((first_part == AFI_STR_URL) && !only_standard) {
        if (!validate_hexstring(second_part, 4)) {
            return "malformed";
        }
        if (!third_part?.length) {
            return "malformed";
        }
        // This indexing assumes "URL+" + second part + "+"
        const url = third_part;
        return parse_url(second_part, url);
    }
    if (first_part == IPV6_STR && !only_standard) {
        if (third_part) {
            return "malformed";
        }
        /* I have decided not to support decoding this non-standard IPv6
        address syntax. It is so complicated that it would require
        importing a module. ipaddr.js seem to be the go-to module for this,
        and its not huge, but it is not ESM and including this one module
        would make this package not zero-dependency. */
        return "unrecognized_syntax";
    }
    if (first_part == IPV4_STR && !only_standard) {
        if (third_part) {
            return "malformed";
        }
        const ip = parse_ipv4(second_part);
        if (!ip) {
            return "malformed";
        }
        const out = new Uint8Array(20);
        out[0] = AFI_IANA_ICP_BIN;
        out[2] = 1;
        out.set(ip, 3);
        return new X213NetworkAddress(out);
    }
    let syntax: DSPSyntax;
    switch (third_part?.[0]) {
        case ('d'): syntax = "decimal"; break;
        case ('x'): syntax = "binary"; break;
        case ('l'): syntax = "iso646"; break;
        default: {
            if (third_part?.startsWith(ECMA_117_BINARY_STR)) {
                syntax = "binary";
            } else {
                // All other encodings are assumed to be decimal.
                // This is true for all of:
                // * RFC-1006+
                // * X.25(80)+
                // * ECMA-117-Decimal+
                syntax = "decimal";
            }
        }
    };
    const maybe_afi = naddr_str_to_afi(first_part, second_part.startsWith("0"), syntax);
    if (!maybe_afi) {
        // Otherwise, assume it is <idp> "+" <hexstring>
        if (third_part) {
            return "malformed";
        }
        return parse_idp_and_dsp(first_part, second_part, syntax);
    }
    const afi = maybe_afi;
    // This MUST be <afi> "+" <idi> [ "+" <dsp> ] syntax.
    const schema = get_nsap_address_schema(afi);
    if (!schema) {
        return "unrecognized_afi";
    }
    const idi_len_digits = schema.max_idi_len_digits;
    if (
        second_part.length > idi_len_digits
        || !/^[0-9]*$/.test(second_part)
    ) {
        return "malformed";
    }
    const bcd_buf = new BCDBuffer();
    bcd_buf.push_byte(afi);
    const idi_pad = schema.leading_zeroes_in_idi ? 1 : 0;
    let idi_deficit = Math.max(idi_len_digits - second_part.length, 0);
    while (idi_deficit > 0) {
        bcd_buf.push_nybble(idi_pad);
        idi_deficit -= 1;
    }
    bcd_buf.push_str(second_part);
    if ((syntax != "decimal") && ((idi_len_digits % 2) > 0)) {
        bcd_buf.push_nybble(0x0F);
    }
    if (!third_part) {
        return new X213NetworkAddress(bcd_buf.as_ref());
    }
    if (third_part.length < 2) {
        // Cannot be empty and must have a discriminator (e.g. 'd')
        return "malformed";
    }
    if (third_part == IETF_RFC_1006_PREFIX_STR) {
        // "RFC-1006" "+" <prefix> "+" <ip> [ "+" <port> [ "+" <tset> ]]
        const prefix = rest_parts.shift();
        const ip = rest_parts.shift();
        if (!prefix || !ip) {
            return "malformed";
        }
        const port = rest_parts.shift();
        const tset = rest_parts.shift();
        const invalid_part = rest_parts.shift(); // Should not exist
        if (invalid_part) {
            return "malformed";
        }
        return parse_rfc_1006_dsp(bcd_buf, prefix, ip, port, tset);
    }
    if (third_part == X25_PREFIX_STR) {
        // "X.25(80)" "+" <prefix> "+" <dte> [ "+" <cudf-or-pid> "+" <hexstring> ]
        const prefix = rest_parts.shift();
        const dte = rest_parts.shift();
        const cudf_of_pid = rest_parts.shift();
        const cudf_of_pid_hex = rest_parts.shift();
        const invalid_part = rest_parts.shift(); // Should not exist
        if (
            !prefix
            || !dte
            || invalid_part
            || (cudf_of_pid && !cudf_of_pid_hex)
        ) {
            return "malformed";
        }
        return parse_x25_dsp(bcd_buf, prefix, dte, cudf_of_pid, cudf_of_pid_hex);
    }
    if (third_part == ECMA_117_BINARY_STR) {
        // "ECMA-117-Binary" "+" <hexstring> "+" <hexstring> "+" <hexstring>
        const d1 = rest_parts.shift();
        const d2 = rest_parts.shift();
        const d3 = rest_parts.shift();
        const d4 = rest_parts.shift(); // Should not exist
        if (!d1 || !d2 || !d3 || d4) {
            return "malformed";
        }
        return parse_ecma117_binary_dsp(bcd_buf, d1, d2, d3);
    }
    if (third_part == ECMA_117_DECIMAL_STR) {
        // "ECMA-117-Decimal" "+" <digitstring> "+" <digitstring> "+" <digitstring>
        const d1 = rest_parts.shift();
        const d2 = rest_parts.shift();
        const d3 = rest_parts.shift();
        const d4 = rest_parts.shift(); // Should not exist
        if (!d1 || !d2 || !d3 || d4) {
            return "malformed";
        }
        return parse_ecma117_decimal_dsp(bcd_buf, d1, d2, d3);
    }
    if (rest_parts.length > 0) {
        return "malformed";
    }
    switch (third_part[0]) {
        case ('d'): return parse_decimal_dsp(bcd_buf, third_part);
        case ('x'): return parse_hexadecimal_dsp(bcd_buf, third_part);
        case ('l'): return parse_textual_dsp(bcd_buf, third_part);
        default: return "unrecognized_syntax";
    }
}
