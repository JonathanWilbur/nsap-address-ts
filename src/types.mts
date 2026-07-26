import { parse_nsap } from "./parse.mjs";
import type { NSAPAddressParseError } from "./error.mjs";
import {
    AFI_IANA_ICP_BIN,
    afi_to_network_type,
    AFI_URL,
    DEFAULT_ITOT_TRANSPORT_SET,
    get_nsap_address_schema,
    ITOT_OVER_IPV4_DEFAULT_PORT,
    RFC_1277_PREFIX,
    type X213NetworkAddressInfo,
} from "./data.mjs";
import { BCDBuffer } from "./bcd.mjs";
import { u16_to_decimal_bytes, u8_to_decimal_bytes, uint8ArrayCompare } from "./utils.mjs";
import { fmt_naddr } from "./display.mjs";

/** IPv4 address */
export type Ipv4Address = [number, number, number, number];

/** IPv6 address */
export type Ipv6Address = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

/**
 * Authority and Format Identifier (AFI): part of an NSAP address
 * 8-bit unsigned integer
 */
export type AFI = number;

/**
 * Network identifier, encoded as Binary-Coded Decimal (BCD), per IETF RFC 1277
 * 8-bit unsigned integer
 */
export type Rfc1277NetworkId = number;

/**
 * Transport set, per IETF RFC 1277
 * 16-bit unsigned integer
 */
export type Rfc1277TransportSet = number;

export type NetworkSocketId = number;

/** Socket information, per IETF RFC 1277 */
export type Rfc1277SocketInfo = [Rfc1277NetworkId, Ipv4Address, NetworkSocketId, Rfc1277TransportSet];

/**
 * X.213 NSAP Domain-Specific Part Syntax
 * 
 * The syntaxes are:
 * 
 * - `decimal`: Binary-Coded Decimal (BCD) with 0b1111 used as padding to
 *   produce an integral number of octets
 * - `binary`: Opaque binary encoding
 * - `iso646`: ISO/IEC 646 characters, which is basically ASCII
 * - `national`: Characters from a national character set
 */
export type DSPSyntax =
    | "decimal"
    | "binary"
    | "iso646"
    | "national"
    ;

/**
 * X.213 NSAP network address type
 * 
 * The types are:
 * 
 * - `x121`: ITU-T Recommendation X.121 address for use in X.25 Networks
 * - `iso_dcc`: ISO Data Country Code (DCC)
 * - `f69`: ITU-T Recommendation F.69 address for use in Telex
 * - `e163`: ITU-T Recommendation E.163 address for use in the PSTN
 * - `e164`: ITU-T Recommendation E.164 address for use in the ISDN
 * - `iso_6523_icd`: ISO/IEC 6523-1 International Code Designator (ICD)
 * - `iana_icp`: IANA Internet Code Point (ICP)
 * - `itu_t_ind`: ITU-T International Network Designator (IND)
 * - `local`: Locally-assigned DSP
 * - `url`: URL, a syntax defined in ITU-T Rec. X.519
 */
export type X213NetworkAddressType =
    /**
     * IDI based on ITU-T Recommendation X.121 address for use in X.25 Networks
     *
     * Quoting ITU-T Recommendation X.213 (2001):
     *
     * > The IDI consists of an international public data network number of up
     * > to 14 digits allocated according to ITU-T Rec. X.121, commencing with
     * > the Data Network Identification Code. The full X.121 number
     * > identifies an authority responsible for allocating and assigning
     * > values of the DSP.
     *
     * See [ITU-T Rec. X.121](https://www.itu.int/rec/T-REC-X.121-200010-I/en) for more
     * information.
     */
    | "x121"
    /**
     * IDI based on International Organization for Standardization (ISO) Data Country Code (DCC)
     *
     * Quoting / Paraphrasing ITU-T Recommendation X.213 (2001):
     *
     * The IDI consists of a fixed length 3-digit numeric code allocated
     * according to ISO 3166-1. The DSP is allocated and assigned by the ISO
     * member body or sponsored organization to which the ISO DCC value has
     * been assigned, or by an organization designated by the holder of the
     * ISO DCC value to carry out this responsibility.
     *
     * See [List of ISO 3166 country codes](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) on Wikipedia.
     */
    | "iso_dcc"
    /**
     * IDI based on ITU-T Recommendation F.69 address for use in Telex
     *
     * Quoting ITU-T Recommendation X.213 (2001):
     *
     * > The IDI consists of a telex number of up to 8 digits, allocated
     * > according to ITU-T Rec. F.69, commencing with a 2- or
     * > 3-digit destination code. The full telex number identifies an
     * > authority responsible for allocating and assigning values of the DSP.
     *
     * A particular IDI for this network type is used to provide a namespace
     * for IP networking within NSAP addressing: `00728722`. Its usage is
     * described in IETF RFC
     *
     * See [ITU-T Rec. F.69](https://www.itu.int/rec/T-REC-F.69-199406-I/en) for more
     * information.
     */
    | "f69"
    /**
     * IDI based on ITU-T Rec. E.163 address for use in the PSTN
     *
     * This is a phone number. This network type was deprecated at or before
     * 2001 and you should use E.164 addressing instead.
     *
     * See [ITU-T Rec. E.163](https://www.itu.int/rec/T-REC-E.163/en) for more
     * information.
     */
    | "e163"
    /**
     * IDI based on ITU-T Rec. E.164 address for use in the ISDN
     *
     * This is a phone number.
     *
     * Quoting ITU-T Recommendation X.213 (2001):
     *
     * > The IDI consists of an international public telecommunication
     * > numbering plan number of up to 15 digits allocated
     * > according to ITU-T Rec. E.164, commencing with the E.164
     * > international number country code. The full E.164 number
     * > identifies an authority responsible for allocating and assigning
     * > values of the DSP.
     *
     * See [ITU-T Rec. E.164](https://www.itu.int/rec/T-REC-E.164/en) for more
     * information.
     */
    | "e164"
    /** IDI is an assigned ISO/IEC 6523-1 International Code Designator (ICD) */
    | "iso_6523_icd"
    /**
     * IPv4 or IPv6 address, depending on the IDI, which is assigned by IANA
     *
     * For either version, the IP address is encoded in binary format, and
     * padded with zeroes to be exactly 20 bytes in total, after the AFI and
     * IDI (which identifies the version).
     *
     * See [IETF RFC 4548](https://www.rfc-editor.org/rfc/rfc4548.html) for more
     * information.
     */
    | "iana_icp"
    /** International Network Designator (IND) */
    | "itu_t_ind"
    /** Locally-assigned DSP */
    | "local"
    /**
     * Special URL encoding defined (without a name) in ITU-T Rec. X.519.
     *
     * See [ITU-T Rec. X.519](https://www.itu.int/rec/T-REC-X.519), Section 11.4
     * for more information.
     */
    | "url"
    ;

/**
 * ITU-T Recommendation X.213 NSAP Address
 *
 * This is composed of three parts, encoded in this order:
 *
 * - Authority and Format Identifier (AFI): always a single byte, which
 *   identifies the network type and the syntax of the encoding that follows
 * - Initial Domain Identifier (IDI): the authority for allocating further
 *   address identifiers, which is always encoded as binary-coded decimal,
 *   and padded with either 0x0 or 0x1 depending on whether leading zeroes are
 *   significant or not until the maximum length is reached in digits.
 * - Domain-Specific Part (DSP): the remainder of the information that
 *   completes the address and is allocated by the authority identified by the
 *   IDI. It can have four abstract syntaxes: BCD, binary, ISO/IEC 646 string,
 *   and a national character encoding.
 *
 * Together, the AFI and IDI are referred to as the Initial Domain Part (IDP).
 *
 * This type does not implement `PartialEq`, `Eq`, or `Hash`, because:
 *
 * 1. Unrecognized encodings could mean that two values cannot be compared for
 *    equality because their semantics are unknown.
 * 2. Even among recognized encodings, it is not clear whether or not the
 *    decimal encoding should always be considered equal to the binary
 *    encoding.
 * 3. The semantics of the DSP encodings seems to be undefined for most AFIs.
 *
 * A simple `Eq` or `Hash` implementation could just use the raw octets, but
 * this could contradict cases where two different encoding should be treated
 * as equal. Letting the caller explicitly hash or compare the octets is more
 * clear as to what the underlying behavior is.
 */
export class X213NetworkAddress {
    public bytes: Uint8Array;
    constructor(bytes: Uint8Array) {
        if (bytes.length < 1) {
            throw new Error("Zero-length IDP in an X.213 network address");
        }
        this.bytes = bytes;
    }

    /**
     * @summary Get the bytes of the NSAP address
     * @returns The bytes of the NSAP address.
     */
    public getOctets(): Uint8Array {
        return this.bytes;
    }

    /**
     * @summary Get the AFI of the NSAP address
     * @description
     * 
     * This function simply returns the first byte of the encoded NSAP address.
     * An NSAP address should never be zero-length, but this will return `-1`
     * if this happens to be the case.
     * 
     * @returns The AFI of the NSAP address.
     */
    public afi(): AFI {
        return this.bytes[0] ?? -1;
    }

    /** Get network type info for this NSAP address */
    public getNetworkTypeInfo(): X213NetworkAddressInfo | undefined {
        return get_nsap_address_schema(this.afi());
    }

    /** Get the network type for this NSAP address */
    public getNetworkType(): X213NetworkAddressType | undefined {
        return afi_to_network_type(this.afi());
    }

    /**
     * @summary Iterate over the IDI digits for this NSAP address
     * @yields Decimal digits: `number`s that can be between 0 and 9.
     * @returns an iterator over the IDI digits, or `undefined` if the AFI is
     *  unrecognized, and therefore, that the NSAP address cannot be parsed,
     *  since the end of the IDI cannot be determined.
     * @function
     */
    public idiDigits(): IterableIterator<number, void> | undefined {
        const addr_type_info = get_nsap_address_schema(this.afi());
        if (!addr_type_info) {
            return undefined;
        }
        const leading_0_sig = addr_type_info.leading_zeroes_in_idi;
        const is_dsp_decimal = addr_type_info.dsp_syntax === "decimal";
        const idi_len = addr_type_info.max_idi_len_digits;
        const idi_len_in_bytes = (idi_len >> 1) + (idi_len % 2);
        const odd_len_idi: boolean = (idi_len % 2) > 0;
        const octets = this.bytes;
        const idi = octets.slice(1, 1 + idi_len_in_bytes);
        const bcd_buf = new BCDBuffer(idi);
        return bcd_buf.iter_digits(
            false,
            leading_0_sig,
            is_dsp_decimal && odd_len_idi,
        );
    }

    /**
     * @Summary Iterate over the DSP digits for this NSAP address, if the DSP is in decimal
     * @yields Decimal digits: `number`s that can be between 0 and 9.
     * @returns an iterator over the DSP digits, or `undefined` if the AFI is
     *  unrecognized, and therefore, that the NSAP address cannot be parsed,
     *  since the end of the IDI cannot be determined. Also returns `undefined`
     *  if the DSP syntax is not decimal.
     * @function
     */
    public dspDigits(): IterableIterator<number, void> | undefined {
        const addr_type_info = get_nsap_address_schema(this.afi());
        if (!addr_type_info) {
            return undefined;
        }
        const is_dsp_decimal = addr_type_info.dsp_syntax === "decimal";
        if (!is_dsp_decimal) {
            return undefined;
        }
        let idi_len = addr_type_info.max_idi_len_digits;
        let idi_len_in_bytes = (idi_len >> 1) + (idi_len % 2);
        let odd_len_idi: boolean = (idi_len % 2) > 0;
        let octets = this.bytes;
        // This needs to take the byte before if odd number of IDI digits
        const [dsp, start_on_lsn] = (is_dsp_decimal && odd_len_idi)
            ? [ octets.slice(idi_len_in_bytes), true ]
            : [ octets.slice(1 + idi_len_in_bytes), false ]
            ;
        const bcd_buf = new BCDBuffer(dsp);
        return bcd_buf.iter_digits(
            start_on_lsn,
            false, // No leading zeroes supported in DSPs
            false, // Only ignore the last nybble if it is 0x0F
        );
    }

    /**
     * @summary Get the encoded URL
     * @description
     * 
     * This function returns the URL encoded in the NSAP address, assuming the
     * AFI is `0xFF`, as defined in ITU-T Rec. X.519.
     * 
     * @returns the URL as a `string`, or `undefined` if this NSAP does not
     *  encode a URL
     * @function
     */
    public getUrl(): string | undefined {
        const octets = this.getOctets();
        // It couldn't be a valid URL in two characters, AFAIK.
        if ((octets.length <= 5) || (octets[0] != AFI_URL)) {
            return undefined;
        }
        return new TextDecoder().decode(octets.slice(3));
    }

    /**
     * @summary Get the encoded IP address
     * @description
     *
     * This only returns an IP address for IANA Internet Code Point (ICP)-based
     * NSAP addresses, and only if the IDI is either `0000` or `0001` (no other
     * syntaxes are recognized).
     * 
     * See [IETF RFC 4548](https://www.rfc-editor.org/rfc/rfc4548.html).
     *
     * @returns `undefined` if this NSAP does not encode an IP address
     * @function
     */
    public getIpAddress(): Ipv4Address | Ipv6Address | undefined {
        const octets = this.getOctets();
        // FIXME: The Rust crate does not check for 20-byte length.
        if ((octets.length !== 20) || (octets[0] != AFI_IANA_ICP_BIN)) {
            return undefined;
        }
        if (octets[1] !== 0 || (typeof octets[2] !== "number") || octets[2] > 1) {
            return undefined;
        }
        // See doc comments on AFI_IANA_ICP_DEC for why it is not supported.
        if (octets[2] === 0) { // IPv6
            return [
                octets[3]!,  octets[4]!,  octets[5]!,  octets[6]!,
                octets[7]!,  octets[8]!,  octets[9]!,  octets[10]!,
                octets[11]!, octets[12]!, octets[13]!, octets[14]!,
                octets[15]!, octets[16]!, octets[17]!, octets[18]!,
            ];
        } else { // IPv4
            return [ octets[3]!, octets[4]!, octets[5]!, octets[6]! ];
        }
    }

    /**
     * @summary Get the RFC 1277 socket address info
     * @description
     * 
     * If this is an NSAP of the syntax defined in
     * [IETF RFC 1277](https://datatracker.ietf.org/doc/html/rfc1277),
     * this function returns, it deconstructs it into parts and returns it
     * as a tuple.
     * 
     * @returns a tuple of `[network, ip_address, port, transport_set]`
     *  or `undefined` if this NSAP does not encode an ITOT socket address.
     * @function
     */
    public getRfc1277Socket(): Rfc1277SocketInfo | undefined {
        const octets = this.getOctets();
        const prefix = octets.subarray(0, RFC_1277_PREFIX.length);
        if (!uint8ArrayCompare(prefix, new Uint8Array(RFC_1277_PREFIX))) {
            return undefined;
        }
        const dsp = octets.slice(RFC_1277_PREFIX.length + 1);
        if (dsp.length < 6) {
            return undefined;
        }
        const bcd_buf = new BCDBuffer(dsp);
        const bcd = Array.from(bcd_buf.iter_digits(false, false, false, false));
        if (bcd.length < 12) {
            return undefined;
        }
        // FIXME: Why did I do this this way in the Rust crate? Why create strings?
        const oct1 = (bcd[0]! * 100) + (bcd[1]! * 10) + bcd[2]!;
        const oct2 = (bcd[3]! * 100) + (bcd[4]! * 10) + bcd[5]!;
        const oct3 = (bcd[6]! * 100) + (bcd[7]! * 10) + bcd[8]!;
        const oct4 = (bcd[9]! * 100) + (bcd[10]! * 10) + bcd[11]!;
        const ip = [oct1, oct2, oct3, oct4] satisfies Ipv4Address;
        if (dsp.length < 9) {
            return [
                octets[5]!,
                ip,
                ITOT_OVER_IPV4_DEFAULT_PORT,
                DEFAULT_ITOT_TRANSPORT_SET,
            ];
        }
        const port: number = (
            (bcd[12]! * 10_000)
            + (bcd[13]! * 1_000)
            + (bcd[14]! * 100)
            + (bcd[15]! * 10)
            + (bcd[16]!)
        );
        if (dsp.length < 11) {
            // FIXME: In the Rust crate, you return the default port here.
            return [
                octets[5]!,
                ip,
                port,
                DEFAULT_ITOT_TRANSPORT_SET,
            ];
        }
        const tset: number = (
            (bcd[17]! * 10_000)
            + (bcd[18]! * 1_000)
            + (bcd[19]! * 100)
            + (bcd[20]! * 10)
            + (bcd[21]!)
        );
        return [octets[5]!, ip, port, tset];
    }

    /**
     * @summary Parse a string into an NSAP address
     * @description
     * 
     * This function parses a string into an NSAP address according to the
     * syntax defined in
     * [IETF RFC 1278](https://datatracker.ietf.org/doc/html/rfc1278).
     * 
     * @param str The string to parse into an NSAP address.
     * @returns The NSAP address, or an error if the string is not a valid NSAP
     *  address.
     * @function
     */
    public static fromString(str: string): X213NetworkAddress | NSAPAddressParseError {
        return parse_nsap(str);
    }

    /**
     * @summary Create a new IANA ICP NSAP address from an IP address
     * @param ip The IP address (either IPv4 or IPv6) to create an NSAP address from.
     * @returns The NSAP address, or an error if the IP address is not a valid IP address.
     * @static
     * @function
     */
    public static fromIpAddress(ip: Ipv4Address | Ipv6Address): X213NetworkAddress | NSAPAddressParseError {
        // IANA ICP NSAP addresses are always 20 bytes
        const out = new Uint8Array(20);
        out[0] = AFI_IANA_ICP_BIN;
        out[1] = 0;
        out[2] = (ip.length === 4) ? 1 : 0;
        out.set(ip, 3);
        return new X213NetworkAddress(out);
    }

    /**
     * Create a new IANA ICP NSAP address from an IPv4 address
     * @param ip The IPv4 address to create an NSAP address from.
     * @returns The NSAP address, or an error if the IP address is not a valid IP address.
     * @static
     * @function
     */
    public static fromIpv4Address(ip: Ipv4Address): X213NetworkAddress | NSAPAddressParseError {
        return X213NetworkAddress.fromIpAddress(ip);
    }

    /**
     * Create a new IANA ICP NSAP address from an IPv6 address
     * @param ip The IPv6 address to create an NSAP address from.
     * @returns The NSAP address, or an error if the IP address is not a valid IP address.
     * @static
     * @function
     */
    public static fromIpv6Address(ip: Ipv6Address): X213NetworkAddress | NSAPAddressParseError {
        return X213NetworkAddress.fromIpAddress(ip);
    }

    /**
     * Create a new NSAP address from a URL
     * @param url The URL to create an NSAP address from.
     * @param idi_byte_2 The second byte of the IDI.
     * @returns The NSAP address, or an error if the URL is not a valid URL.
     * @static
     * @function
     * @private
     */
    private static fromUrl(url: string, idi_byte_2: number): X213NetworkAddress | NSAPAddressParseError {
        const urlBytes = new TextEncoder().encode(url);
        const out = new Uint8Array(3 + urlBytes.length);
        out[0] = AFI_URL;
        out[1] = 0;
        out[2] = idi_byte_2;
        out.set(urlBytes, 3);
        return new X213NetworkAddress(out);
    }

    /**
     * @summary Create a new X.519 ITOT URL NSAP address from a URL
     * @param url The URL to create an NSAP address from.
     * @returns The NSAP address, or an error if the URL is not a valid URL.
     * @static
     * @function
     */
    public static fromItotUrl(url: string): X213NetworkAddress | NSAPAddressParseError {
        return X213NetworkAddress.fromUrl(url, 0);
    }

    /**
     * @summary Create a new X.519 Non-OSI (LDAP, IDM, etc.) URL NSAP address from a URL
     * @param url The URL to create an NSAP address from.
     * @returns The NSAP address, or an error if the URL is not a valid URL.
     * @static
     * @function
     */
    public static fromNonOsiUrl(url: string): X213NetworkAddress | NSAPAddressParseError {
        return X213NetworkAddress.fromUrl(url, 1);
    }

    /**
     * @summary Create an ITOT NSAP address from a socket address and optional transport set
     * @description
     *
     * Note that this only supports IPv4 due to the defined syntax; IPv6 is not
     * supported.
     *
     * @param network The network number.
     * @param ip The IPv4 address.
     * @param port The port number.
     * @param tset The transport set number, which is optional
     * @returns The NSAP address, or an error if the socket address is not a valid socket address.
     * @static
     * @function
     */
    public static fromSocketAddress(
        network: number,
        ip: Ipv4Address,
        port: number,
        tset?: number,
    ): X213NetworkAddress {
        let bcd_buf = new BCDBuffer();
        ip
            .map((o) => u8_to_decimal_bytes(o))
            .forEach((dec_oct) => bcd_buf.push_ascii_bytes(dec_oct));
        if (
            (
                (typeof port === "number")
                && (port != ITOT_OVER_IPV4_DEFAULT_PORT)
            )
            || (
                (typeof tset === "number")
                && (tset != DEFAULT_ITOT_TRANSPORT_SET)
            )
        ) {
            const port_str = u16_to_decimal_bytes(port);
            bcd_buf.push_ascii_bytes(port_str);
            if (typeof tset === "number") {
                const tset_str = u16_to_decimal_bytes(tset);
                bcd_buf.push_ascii_bytes(tset_str);
            } else {
                bcd_buf.push_nybble(0xF);
            }
        }
        const bcd_len = bcd_buf.len_in_bytes();
        const out = new Uint8Array(6 + bcd_len);
        out.set(RFC_1277_PREFIX, 0);
        out[5] = network;
        out.set(bcd_buf.as_ref(), 6);
        return new X213NetworkAddress(out);
    }

    /**
     * @summary Convert to a `String` using the `NS+<hex>` syntax
     * @description
     *
     * This is desirable for portability / interoperability: the `NS+<hex>`
     * syntax is the easiest display syntax to parse and leaves no ambiguity of
     * encoding. This is a great choice if you are exporting an NSAP address in
     * string format for use in other systems.
     *
     * The output looks like `NS+A433BB93C1`.
     * 
     * @returns The NSAP address as a string.
     * @function
     */
    public toNSString(): string {
        const hex = Array.from(this.getOctets())
            .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
            .join("")
            ;
        return `NS+${hex}`;
    }

    /**
     * @summary Convert an NSAP address to a string that mostly adheres to IETF RFC 1278
     * @description
     * 
     * This function converts an NSAP address to a string that is mostly
     * compliant with
     * [IETF RFC 1278](https://datatracker.ietf.org/doc/html/rfc1278).
     * 
     * It is not compliant by having some modernized syntaxes for
     * representing IANA Internet Code Point (ICP) addresses (which are IP
     * addresses), for URLs, which are defined in ITU-T Rec. X.519, and
     * for a few other things. If you need a fully-compliant string,
     * use {@link toRfc1278String} instead.
     * 
     * @returns A string representation of the NSAP address.
     */
    public toString(): string {
        return fmt_naddr(this, false);
    }

    /**
     * @summary Convert an NSAP address to a string that adheres to IETF RFC 1278
     * @description
     * 
     * This function converts an NSAP address to a string that is fully
     * compliant with
     * [IETF RFC 1278](https://datatracker.ietf.org/doc/html/rfc1278).
     * 
     * If you can tolerate some non-standard syntaxes that are much more
     * modern and user-friendly, use {@link toString} instead.
     * 
     * @returns A string representation of the NSAP address.
     */
    public toRfc1278String(): string {
        return fmt_naddr(this, true);
    }

    /**
     * @summary Check if this NSAP address is equal to another NSAP address
     * @description
     * 
     * This function checks if this NSAP address is equal to another NSAP address.
     * 
     * @param other The other NSAP address to compare to.
     * @returns `true` if the NSAP addresses are equal, `false` otherwise.
     */
    public isEqualTo(other: X213NetworkAddress): boolean {
        return uint8ArrayCompare(this.getOctets(), other.getOctets());
    }
}

export default X213NetworkAddress;
