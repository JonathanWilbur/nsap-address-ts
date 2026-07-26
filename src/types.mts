import { parse_nsap } from "./parse.mjs";
import type { RFC1278ParseError } from "./error.mjs";
import { AFI_IANA_ICP_BIN, afi_to_network_type, AFI_URL, DEFAULT_ITOT_TRANSPORT_SET, get_nsap_address_schema, ITOT_OVER_IPV4_DEFAULT_PORT, RFC_1277_PREFIX, type X213NetworkAddressInfo } from "./data.mjs";
import { BCDBuffer } from "./bcd.mjs";
import { u16_to_decimal_bytes, u8_to_decimal_bytes, uint8ArrayCompare } from "./utils.mjs";
import { fmt_naddr } from "./display.mjs";

export type Ipv4Address = [number, number, number, number];
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

// TODO: Move variant docs to the type definition.
/** X.213 NSAP Domain-Specific Part Syntax */
export type DSPSyntax =
    /**
     * Binary-Coded Decimal (BCD) with 0b1111 used as padding to produce an
     * integral number of octets
     */
    | "decimal"
    /** Opaque binary encoding */
    | "binary"
    /** ISO/IEC 646 characters, which is basically ASCII */
    | "iso646"
    /** Characters from a national character set */
    | "national"
    ;


// TODO: Move variant docs to the type definition.
/** X.213 NSAP network address type */
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
     * See: <https://www.itu.int/rec/T-REC-X.121-200010-I/en>
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
     * See: <https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes>
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
     * See: <https://www.itu.int/rec/T-REC-F.69-199406-I/en>
     */
    | "f69"
    /**
     * IDI based on ITU-T Rec. E.163 address for use in the PSTN
     *
     * This is a phone number. This network type was deprecated at or before
     * 2001 and you should use E.164 addressing instead.
     *
     * See: <https://www.itu.int/rec/T-REC-E.163/en>
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
     * See: <https://www.itu.int/rec/T-REC-E.164/en>
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
     * See: <https://www.rfc-editor.org/rfc/rfc4548.html>
     */
    | "iana_icp"
    /** International Network Designator (IND) */
    | "itu_t_ind"
    /** Locally-assigned DSP */
    | "local"
    /**
     * Special URL encoding defined (without a name) in ITU-T Rec. X.519.
     *
     * See: <https://www.itu.int/rec/T-REC-X.519>, Section 11.4
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

    // TODO: There is more to implement.

    public get_octets(): Uint8Array {
        return this.bytes;
    }

    public afi(): AFI {
        return this.bytes[0] ?? -1;
    }

    /** Get network type info for this NSAP address */
    public get_network_type_info(): X213NetworkAddressInfo | undefined {
        return get_nsap_address_schema(this.afi());
    }

    /** Get the network type for this NSAP address */
    public get_network_type(): X213NetworkAddressType | undefined {
        return afi_to_network_type(this.afi());
    }

    /**
     * Iterate over the IDI digits for this NSAP address
     *
     * Returns `None` if the AFI is unrecognized, and therefore, that the
     * NSAP address cannot be parsed, since the end of the IDI cannot be
     * determined.
     */
    public idi_digits(): IterableIterator<number, void> | undefined {
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
     * Iterate over the IDI digits for this NSAP address, if the DSP is in decimal
     *
     * Returns `None` if the AFI is unrecognized, and therefore, that the
     * NSAP address cannot be parsed, since the end of the IDI cannot be
     * determined. Also returns `None` if the DSP syntax is not decimal.
     */
    public dsp_digits(): IterableIterator<number, void> | undefined {
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
     * Get the encoded URL
     *
     * This returns `None` if this NSAP does not encode a URL
     */
    public get_url(): string | undefined {
        const octets = this.get_octets();
        // It couldn't be a valid URL in two characters, AFAIK.
        if ((octets.length <= 5) || (octets[0] != AFI_URL)) {
            return undefined;
        }
        return new TextDecoder().decode(octets.slice(3));
    }

    /**
     * Get the encoded IP address
     *
     * This only returns an IP address for IANA ICP-based NSAP addresses
     *
     * This returns `None` if this NSAP does not encode an IP address
     * See: <https://www.rfc-editor.org/rfc/rfc4548.html>
     */
    public get_ip(): Ipv4Address | Ipv6Address | undefined {
        const octets = this.get_octets();
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
     * Get the RFC 1277 socket address info
     *
     * Specifically, if this returns `Some(_)`, it contains a tuple of the
     * IP network, the socket address, and optionally, the transport-set, as
     * defined in IETF RFC 1277, in that order.
     *
     * This returns `None` if this NSAP does not encode an ITOT socket address
     */
    public get_rfc1277_socket(): Rfc1277SocketInfo | undefined {
        const octets = this.get_octets();
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

    public static fromString(str: string): X213NetworkAddress | RFC1278ParseError {
        return parse_nsap(str);
    }

    /** Create a new IANA ICP NSAP address from an IP address */
    public static from_ip(ip: Ipv4Address | Ipv6Address): X213NetworkAddress | RFC1278ParseError {
        // IANA ICP NSAP addresses are always 20 bytes
        const out = new Uint8Array(20);
        out[0] = AFI_IANA_ICP_BIN;
        out[1] = 0;
        out[2] = (ip.length === 4) ? 1 : 0;
        out.set(ip, 3);
        return new X213NetworkAddress(out);
    }

    /** Create a new IANA ICP NSAP address from an IPv4 address */
    public static from_ipv4(ip: Ipv4Address): X213NetworkAddress | RFC1278ParseError {
        return X213NetworkAddress.from_ip(ip);
    }

    /** Create a new IANA ICP NSAP address from an IPv6 address */
    public static from_ipv6(ip: Ipv6Address): X213NetworkAddress | RFC1278ParseError {
        return X213NetworkAddress.from_ip(ip);
    }

    private static from_url(url: string, idi_byte_2: number): X213NetworkAddress | RFC1278ParseError {
        const urlBytes = new TextEncoder().encode(url);
        const out = new Uint8Array(3 + urlBytes.length);
        out[0] = AFI_URL;
        out[1] = 0;
        out[2] = idi_byte_2;
        out.set(urlBytes, 3);
        return new X213NetworkAddress(out);
    }

    /** Create a new X.519 ITOT URL NSAP address from a URL */
    public static from_itot_url(url: string): X213NetworkAddress | RFC1278ParseError {
        return X213NetworkAddress.from_url(url, 0);
    }

    /** Create a new X.519 Non-OSI (LDAP, IDM, etc.) URL NSAP address from a URL */
    public static from_non_osi_url(url: string): X213NetworkAddress | RFC1278ParseError {
        return X213NetworkAddress.from_url(url, 1);
    }

    /**
     * Create an ITOT NSAP address from a socket address and optional transport set
     *
     * Note that this only supports IPv4 due to the encoding.
     */
    public static from_socket_addr_v4(
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
     * Convert to a `String` using the `NS+<hex>` syntax
     *
     * This is desirable for portability / interoperability: the `NS+<hex>`
     * syntax is the easiest display syntax to parse and leaves no ambiguity of
     * encoding. This is a great choice if you are exporting an NSAP address in
     * string format for use in other systems.
     *
     * The output looks like `NS+A433BB93C1`.
     */
    public to_ns_string(): string {
        const hex = Array.from(this.get_octets())
            .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
            .join("")
            ;
        return `NS+${hex}`;
    }

    // TODO: JSDoc
    public toString(): string {
        return fmt_naddr(this, false);
    }

    // TODO: isEqualTo() (this can be trivial)
}

export default X213NetworkAddress;
