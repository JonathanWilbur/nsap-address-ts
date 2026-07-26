/**
 * Constants, identifiers, codes, data and functions for mapping or lookups
 * @module data
 */
// use crate::{AFI, DSPSyntax, X213NetworkAddressType};
import type { AFI, Rfc1277TransportSet, DSPSyntax, X213NetworkAddressType } from "./types.mts";

/// The default ISO Transport over TCP transport set (t-set) per IETF RFC 1277
export const DEFAULT_ITOT_TRANSPORT_SET: Rfc1277TransportSet = 1;

/**
 * The AFI is mandatory. The IDI may be zero bytes (in the case of Local IDI),
 * and the DSP (presumably) MUST be present.
 */
export const SMALLEST_VALID_NSAP_ADDR: number = 2;

/// The URL AFI defined in ITU-T Recommendation X.519 (2019).
///
/// The IDI has a fixed length of four digits. The DSP encodes a URL in an
/// unspecified encoding (presumably UTF-8).
export const AFI_URL: number  = 0xFF;
/// AFI for an X.121 Address (used for X.25), decimal, leading non-zero digit
export const AFI_X121_DEC_LEADING_NON_ZERO: number  = 0x36;
/// AFI for an X.121 Address (used for X.25), decimal, leading zero digit
export const AFI_X121_DEC_LEADING_ZERO: number  = 0x52;
/// AFI for an X.121 Address (used for X.25), binary, leading non-zero digit
export const AFI_X121_BIN_LEADING_NON_ZERO: number  = 0x37;
/// AFI for an X.121 Address (used for X.25), binary, leading zero digit
export const AFI_X121_BIN_LEADING_ZERO: number  = 0x53;
/// AFI for ISO Data Country Code (DCC) decimal
export const AFI_ISO_DCC_DEC: number  = 0x38;
/// AFI for ISO Data Country Code (DCC) binary
export const AFI_ISO_DCC_BIN: number  = 0x39;
/// AFI for F.69 / Telex, decimal, leading non-zero digit
export const AFI_F69_DEC_LEADING_NON_ZERO: number  = 0x40;
/// AFI for F.69 / Telex, decimal, leading zero digit
export const AFI_F69_DEC_LEADING_ZERO: number  = 0x54;
/// AFI for F.69 / Telex, binary, leading non-zero digit
export const AFI_F69_BIN_LEADING_NON_ZERO: number  = 0x41;
/// AFI for F.69 / Telex, binary, leading zero digit
export const AFI_F69_BIN_LEADING_ZERO: number  = 0x55;
/// AFI for E.163 number (used in PSTN), decimal, leading non-zero digit
export const AFI_E163_DEC_LEADING_NON_ZERO: number  = 0x42;
/// AFI for E.163 number (used in PSTN), decimal, leading zero digit
export const AFI_E163_DEC_LEADING_ZERO: number  = 0x56;
/// AFI for E.163 number (used in PSTN), binary, leading non-zero digit
export const AFI_E163_BIN_LEADING_NON_ZERO: number  = 0x43;
/// AFI for E.163 number (used in PSTN), binary, leading zero digit
export const AFI_E163_BIN_LEADING_ZERO: number  = 0x57;
/// AFI for E.164 number (used in ISDN), decimal, leading non-zero digit
export const AFI_E164_DEC_LEADING_NON_ZERO: number  = 0x44;
/// AFI for E.164 number (used in ISDN), decimal, leading zero digit
export const AFI_E164_DEC_LEADING_ZERO: number  = 0x58;
/// AFI for E.164 number (used in ISDN), binary, leading non-zero digit
export const AFI_E164_BIN_LEADING_NON_ZERO: number  = 0x45;
/// AFI for E.164 number (used in ISDN), binary, leading zero digit
export const AFI_E164_BIN_LEADING_ZERO: number  = 0x59;
/// AFI for ISO/IEC 6523 International Code Designator (ICD), decimal
export const AFI_ISO_6523_ICD_DEC: number  = 0x46;
/// AFI for ISO/IEC 6523 International Code Designator (ICD), binary
export const AFI_ISO_6523_ICD_BIN: number  = 0x47;

/// AFI for IANA Internet Code Point (ICP), decimal, per IETF RFFC 4548
///
/// Quoting IETF RFC 4548:
///
/// > One of these two AFIs ('34') is
/// > allocated for assignment of NSAPA in Decimal Numeric Format.  This
/// > document does not address allocation for this AFI as it is not clear
/// > what use (if any) can be made of this encoding format at this time.
export const AFI_IANA_ICP_DEC: number  = 0x34;

/// AFI for IANA Internet Code Point (ICP), binary, per IETF RFFC 4548
export const AFI_IANA_ICP_BIN: number  = 0x35;

/// AFI for ITU Rec. E.191.1 International Network Designator (IDN), decimal
export const AFI_ITU_T_IND_DEC: number  = 0x76;
/// AFI for ITU Rec. E.191.1 International Network Designator (IDN), decimal
export const AFI_ITU_T_IND_BIN: number  = 0x77;
/// Local AFI, decimal
export const AFI_LOCAL_DEC: number  = 0x48;
/// Local AFI, binary
export const AFI_LOCAL_BIN: number  = 0x49;
/// Local AFI, ISO/IEC 646 (ASCII or ASCII-like)
export const AFI_LOCAL_ISO_IEC_646: number  = 0x50;
/// Local AFI, characters from a national character set
export const AFI_LOCAL_NATIONAL: number  = 0x51;

/// Group AFI for [AFI_X121_DEC_LEADING_NON_ZERO]
export const GROUP_AFI_X121_DEC_LEADING_NON_ZERO: number  = 0xBA;
/// Group AFI for [AFI_X121_DEC_LEADING_ZERO]
export const GROUP_AFI_X121_DEC_LEADING_ZERO: number  = 0xCA;
/// Group AFI for [AFI_X121_BIN_LEADING_NON_ZERO]
export const GROUP_AFI_X121_BIN_LEADING_NON_ZERO: number  = 0xBB;
/// Group AFI for [AFI_X121_BIN_LEADING_ZERO]
export const GROUP_AFI_X121_BIN_LEADING_ZERO: number  = 0xCB;
/// Group AFI for [AFI_ISO_DCC_DEC]
export const GROUP_AFI_ISO_DCC_DEC: number  = 0xBC;
/// Group AFI for [AFI_ISO_DCC_BIN]
export const GROUP_AFI_ISO_DCC_BIN: number  = 0xBD;
/// Group AFI for [AFI_F69_DEC_LEADING_NON_ZERO]
export const GROUP_AFI_F69_DEC_LEADING_NON_ZERO: number  = 0xBE;
/// Group AFI for [AFI_F69_DEC_LEADING_ZERO]
export const GROUP_AFI_F69_DEC_LEADING_ZERO: number  = 0xCC;
/// Group AFI for [AFI_F69_BIN_LEADING_NON_ZERO]
export const GROUP_AFI_F69_BIN_LEADING_NON_ZERO: number  = 0xBF;
/// Group AFI for [AFI_F69_BIN_LEADING_ZERO]
export const GROUP_AFI_F69_BIN_LEADING_ZERO: number  = 0xCD;
/// Group AFI for [AFI_E163_DEC_LEADING_NON_ZERO]
export const GROUP_AFI_E163_DEC_LEADING_NON_ZERO: number  = 0xC0;
/// Group AFI for [AFI_E163_DEC_LEADING_ZERO]
export const GROUP_AFI_E163_DEC_LEADING_ZERO: number  = 0xCE;
/// Group AFI for [AFI_E163_BIN_LEADING_NON_ZERO]
export const GROUP_AFI_E163_BIN_LEADING_NON_ZERO: number  = 0xC1;
/// Group AFI for [AFI_E163_BIN_LEADING_ZERO]
export const GROUP_AFI_E163_BIN_LEADING_ZERO: number  = 0xCF;
/// Group AFI for [AFI_E164_DEC_LEADING_NON_ZERO]
export const GROUP_AFI_E164_DEC_LEADING_NON_ZERO: number  = 0xC2;
/// Group AFI for [AFI_E164_DEC_LEADING_ZERO]
export const GROUP_AFI_E164_DEC_LEADING_ZERO: number  = 0xD0;
/// Group AFI for [AFI_E164_BIN_LEADING_NON_ZERO]
export const GROUP_AFI_E164_BIN_LEADING_NON_ZERO: number  = 0xC3;
/// Group AFI for [AFI_E164_BIN_LEADING_ZERO]
export const GROUP_AFI_E164_BIN_LEADING_ZERO: number  = 0xD1;
/// Group AFI for [AFI_ISO_6523_ICD_DEC]
export const GROUP_AFI_ISO_6523_ICD_DEC: number  = 0xC4;
/// Group AFI for [AFI_ISO_6523_ICD_BIN]
export const GROUP_AFI_ISO_6523_ICD_BIN: number  = 0xC5;
/// Group AFI for [AFI_IANA_ICP_DEC]
export const GROUP_AFI_IANA_ICP_DEC: number  = 0xB8;
/// Group AFI for [AFI_IANA_ICP_BIN]
export const GROUP_AFI_IANA_ICP_BIN: number  = 0xB9;
/// Group AFI for [AFI_ITU_T_IND_DEC]
export const GROUP_AFI_ITU_T_IND_DEC: number  = 0xE2;
/// Group AFI for [AFI_ITU_T_IND_BIN]
export const GROUP_AFI_ITU_T_IND_BIN: number  = 0xE3;
/// Group AFI for [AFI_LOCAL_DEC]
export const GROUP_AFI_LOCAL_DEC: number  = 0xC6;
/// Group AFI for [AFI_LOCAL_BIN]
export const GROUP_AFI_LOCAL_BIN: number  = 0xC7;
/// Group AFI for [AFI_LOCAL_ISO_IEC_646]
export const GROUP_AFI_LOCAL_ISO_IEC_646: number  = 0xC8;
/// Group AFI for [AFI_LOCAL_NATIONAL]
export const GROUP_AFI_LOCAL_NATIONAL: number  = 0xC9;

/// Maximum decimal DSP length in digits for X.121 / X.25 addressing
export const MAX_DEC_DSP_LEN_DIGITS_X121: number  = 24;
/// Maximum decimal DSP length in digits for ISO DCC
export const MAX_DEC_DSP_LEN_DIGITS_ISO_DCC: number  = 35;
/// Maximum decimal DSP length in digits for F.69 addressing / Telex
export const MAX_DEC_DSP_LEN_DIGITS_F69: number  = 30;
/// Maximum decimal DSP length in digits for E.163 / PSTN addressing
export const MAX_DEC_DSP_LEN_DIGITS_E163: number  = 26;
/// Maximum decimal DSP length in digits for E.164 / ISDN addressing
export const MAX_DEC_DSP_LEN_DIGITS_E164: number  = 23;
/// Maximum decimal DSP length in digits for ISO/IEC 6523 ICD addressing
export const MAX_DEC_DSP_LEN_DIGITS_ISO_6523_ICD: number  = 34;
/// Maximum decimal DSP length in digits for IANA ICP (IPv4 or IPv6) addressing
export const MAX_DEC_DSP_LEN_DIGITS_IANA_ICP: number  = 34;
/// Maximum decimal DSP length in digits for ITU-T IND addressing
export const MAX_DEC_DSP_LEN_DIGITS_ITU_T_IND: number  = 32;
/// Maximum decimal DSP length in digits for local addressing
export const MAX_DEC_DSP_LEN_DIGITS_LOCAL: number  = 38;

/// Maximum binary DSP length in bytes for X.121 / X.25 addressing
export const MAX_BIN_DSP_LEN_X121: number  = 12;
/// Maximum binary DSP length in bytes for ISO DCC
export const MAX_BIN_DSP_LEN_ISO_DCC: number  = 17;
/// Maximum binary DSP length in bytes for F.69 addressing / Telex
export const MAX_BIN_DSP_LEN_F69: number  = 15;
/// Maximum binary DSP length in bytes for E.163 / PSTN addressing
export const MAX_BIN_DSP_LEN_E163: number  = 13;
/// Maximum binary DSP length in bytes for E.164 / ISDN addressing
export const MAX_BIN_DSP_LEN_E164: number  = 11;
/// Maximum binary DSP length in bytes for ISO/IEC 6523 ICD addressing
export const MAX_BIN_DSP_LEN_ISO_6523_ICD: number  = 17;
/// Maximum binary DSP length in bytes for IANA ICP (IPv4 or IPv6) addressing
export const MAX_BIN_DSP_LEN_IANA_ICP: number  = 17;
/// Maximum binary DSP length in bytes for ITU-T IND addressing
export const MAX_BIN_DSP_LEN_ITU_T_IND: number  = 16;
/// Maximum binary DSP length in bytes for local addressing
export const MAX_BIN_DSP_LEN_LOCAL: number  = 19;

/// Maximum ISO/IEC 646-encoded DSP length in bytes for local addressing
export const MAX_ISO_IEC_646_LEN_LOCAL: number  = 19;
/// Maximum national character-encoded DSP length in bytes for local addressing
export const MAX_NATIONAL_CHAR_LEN_LOCAL: number  = 9;

/// Maximum IDI length in digits for X.121 / X.25 addressing
export const MAX_IDI_LEN_DIGITS_X121: number  = 14; // Up to
/// Maximum IDI length in digits for ISO DCC
export const MAX_IDI_LEN_DIGITS_ISO_DCC: number  = 3; // Exactly
/// Maximum IDI length in digits for F.69 addressing / Telex
export const MAX_IDI_LEN_DIGITS_F69: number  = 8; // Up to
/// Maximum IDI length in digits for E.163 / PSTN addressing
export const MAX_IDI_LEN_DIGITS_E163: number  = 12; // Up to
/// Maximum IDI length in digits for E.164 / ISDN addressing
export const MAX_IDI_LEN_DIGITS_E164: number  = 15; // Up to
/// Maximum IDI length in digits for ISO/IEC 6523 ICD addressing
export const MAX_IDI_LEN_DIGITS_ISO_6523_ICD: number  = 4; // Exactly
/// Maximum IDI length in digits for IANA ICP (IPv4 or IPv6) addressing
export const MAX_IDI_LEN_DIGITS_IANA_ICP: number  = 4; // Exactly
/// Maximum IDI length in digits for ITU-T IND addressing
export const MAX_IDI_LEN_DIGITS_ITU_T_IND: number  = 6; // Exactly
/// Maximum IDI length in digits for local addressing
export const MAX_IDI_LEN_DIGITS_LOCAL: number  = 0; // Exactly
/// Maximum IDI length in digits for ITU-T Rec. X.519 URL NSAPs
export const MAX_IDI_LEN_DIGITS_URL: number  = 4; // Exactly.

// DSP Prefixes that start with 0x54, 0x00, 0x72, 0x87, 0x22,

/// IETF RFC 1277 well-known network: International X.25
export const RFC_1277_WELL_KNOWN_NETWORK_INTL_X25: number  = 0x01;
/// IETF RFC 1277 well-known network: JANET
///
/// See: <https://en.wikipedia.org/wiki/JANET>
export const RFC_1277_WELL_KNOWN_NETWORK_JANET: number  = 0x02;
/// IETF RFC 1277 well-known network: DARPA/NSF Internet (The internet)
export const RFC_1277_WELL_KNOWN_NETWORK_DARPA_NSF_INTERNET: number  = 0x03;
/// IETF RFC 1277 well-known network: IXI
///
/// See: <https://cordis.europa.eu/project/id/2718>
export const RFC_1277_WELL_KNOWN_NETWORK_IXI: number  = 0x06;
/// ITU-T Rec. X.519 DSP prefix for LDAP
export const ITU_X519_DSP_PREFIX_LDAP: number  = 0x11;
/// ITU-T Rec. X.519 DSP prefix for IDM over IPv4
///
/// See: <https://www.itu.int/rec/T-REC-X.519/en>
export const ITU_X519_DSP_PREFIX_IDM_OVER_IPV4: number  = 0x10;
/// ITU-T Rec. X.519 DSP prefix for ISO Transport over TCP (ITOT) over IPv4
///
/// See: <https://datatracker.ietf.org/doc/rfc2126/>
export const ITU_X519_DSP_PREFIX_ITOT_OVER_IPV4: number  = RFC_1277_WELL_KNOWN_NETWORK_DARPA_NSF_INTERNET;

/// Default TCP port for ISO Transport over TCP (ITOT) per IETF RFC 2126
///
/// See: <https://datatracker.ietf.org/doc/rfc2126/>
export const ITOT_OVER_IPV4_DEFAULT_PORT: number = 102;

/// AFI string for X.121 addressing, per IETF RFC 1278
export const AFI_STR_X121: string = "X121";
/// AFI string for ISO DCC addressing, per IETF RFC 1278
export const AFI_STR_DCC: string = "DCC";
/// AFI string for Telex / F.69 addressing, per IETF RFC 1278
export const AFI_STR_TELEX: string = "TELEX";
/// AFI string for PSTN / E.163 addressing, per IETF RFC 1278
export const AFI_STR_PSTN: string = "PSTN";
/// AFI string for ISDN / E.164 addressing, per IETF RFC 1278
export const AFI_STR_ISDN: string = "ISDN";
/// AFI string for ISO/IEC 6523 ICD addressing, per IETF RFC 1278
export const AFI_STR_ICD: string = "ICD";
/// Not-standard AFI string for IANA ICP addressing
export const AFI_STR_ICP: string = "ICP";
/// Not-standard AFI string for ITU-T IND addressing
export const AFI_STR_IND: string = "IND";
/// AFI string for local addressing, per IETF RFC 1278
export const AFI_STR_LOCAL: string = "LOCAL";
/// Not-standard AFI string for ITU-T Rec. X.519 URL-based addressing
export const AFI_STR_URL: string = "URL";

/// IETF RFC 1277 Telex / F.69 number for non-OSI networks
export const IETF_RFC_1277_TELEX_NUMBER_STR: string = "00728722";
/// IETF RFC 1278 DSP string for ISO Transport over TCP (ITOT)
export const IETF_RFC_1006_PREFIX_STR: string = "RFC-1006";
/// IETF RFC 1278 DSP string for X.25
export const X25_PREFIX_STR: string = "X.25(80)";
/// IETF RFC 1278 DSP string for ECMA 117 binary syntax
export const ECMA_117_BINARY_STR: string = "ECMA-117-Binary";
/// IETF RFC 1278 DSP string for ECMA 117 decimal syntax
export const ECMA_117_DECIMAL_STR: string = "ECMA-117-Decimal";

/// Non-standard string for NSAP-encoded IPv4 addresses
export const IPV4_STR: string = "IP4";
/// Non-standard string for NSAP-encoded IPv6 addresses
export const IPV6_STR: string = "IP6";

/// IANA-allocated Internet Code Point for IPv4 per IETF RFC 4548
///
/// See: <https://www.rfc-editor.org/rfc/rfc4548.html>
export const IANA_ICP_IDI_IPV4: [number, number] = [0, 1];
/// IANA-allocated Internet Code Point for IPv6 per IETF RFC 4548
///
/// See: <https://www.rfc-editor.org/rfc/rfc4548.html>
export const IANA_ICP_IDI_IPV6: [number, number] = [0, 0];

/// IETF RFC 1277 NSAP prefix for non-OSI addressing
export const RFC_1277_PREFIX: [number, number, number, number, number] = [
    AFI_F69_DEC_LEADING_ZERO, // AFI
    0x00,
    0x72,
    0x87,
    0x22, // IDI
];

/// Maps group AFIs to individual ones per Table A.2 in ITU-T Rec. X.213
export function group_afi_to_individual_afi(afi: AFI): AFI {
    switch (afi) {
        case (0xA1): return 0x11;
        case (0xA2): return 0x12;
        case (0xA3): return 0x13;
        case (0xA4): return 0x14;
        case (0xA5): return 0x15;
        case (0xA6): return 0x16;
        case (0xA7): return 0x17;
        case (0xA8): return 0x18;
        case (0xA9): return 0x19;
        case (0xAB): return 0x21;
        case (0xAC): return 0x22;
        case (0xAD): return 0x23;
        case (0xAE): return 0x24;
        case (0xAF): return 0x25;
        case (0xB0): return 0x26;
        case (0xB1): return 0x27;
        case (0xB2): return 0x28;
        case (0xB3): return 0x29;
        case (0xB4): return 0x30;
        case (0xB5): return 0x31;
        case (0xB6): return 0x32;
        case (0xB7): return 0x33;
        case (0xB8): return 0x34;
        case (0xB9): return 0x35;
        case (0xBA): return 0x36;
        case (0xBB): return 0x37;
        case (0xBC): return 0x38;
        case (0xBD): return 0x39;
        case (0xBE): return 0x40;
        case (0xBF): return 0x41;
        case (0xC0): return 0x42;
        case (0xC1): return 0x43;
        case (0xC2): return 0x44;
        case (0xC3): return 0x45;
        case (0xC4): return 0x46;
        case (0xC5): return 0x47;
        case (0xC6): return 0x48;
        case (0xC7): return 0x49;
        case (0xC8): return 0x50;
        case (0xC9): return 0x51;
        case (0xCA): return 0x52;
        case (0xCB): return 0x53;
        case (0xCC): return 0x54;
        case (0xCD): return 0x55;
        case (0xCE): return 0x56;
        case (0xCF): return 0x57;
        case (0xD0): return 0x58;
        case (0xD1): return 0x59;
        case (0xD2): return 0x60;
        case (0xD3): return 0x61;
        case (0xD4): return 0x62;
        case (0xD5): return 0x63;
        case (0xD6): return 0x64;
        case (0xD7): return 0x65;
        case (0xD8): return 0x66;
        case (0xD9): return 0x67;
        case (0xDA): return 0x68;
        case (0xDB): return 0x69;
        case (0xDC): return 0x70;
        case (0xDD): return 0x71;
        case (0xDE): return 0x72;
        case (0xDF): return 0x73;
        case (0xE0): return 0x74;
        case (0xE1): return 0x75;
        case (0xE2): return 0x76;
        case (0xE3): return 0x77;
        case (0xE4): return 0x78;
        case (0xE5): return 0x79;
        case (0xE6): return 0x80;
        case (0xE7): return 0x81;
        case (0xE8): return 0x82;
        case (0xE9): return 0x83;
        case (0xEA): return 0x84;
        case (0xEB): return 0x85;
        case (0xEC): return 0x86;
        case (0xED): return 0x87;
        case (0xEE): return 0x88;
        case (0xEF): return 0x89;
        case (0xF0): return 0x90;
        case (0xF1): return 0x91;
        case (0xF2): return 0x92;
        case (0xF3): return 0x93;
        case (0xF4): return 0x94;
        case (0xF5): return 0x95;
        case (0xF6): return 0x96;
        case (0xF7): return 0x97;
        case (0xF8): return 0x98;
        case (0xF9): return 0x99;
        default: return afi;
    }
}

/// information about a particular NSAP syntax and what network it addresses
export interface X213NetworkAddressInfo {
    /// The network type for this AFI
    network_type: X213NetworkAddressType;
    /// Whether there are leading zeroes in the IDI for this AFI
    leading_zeroes_in_idi: boolean;
    /// The Domain Specific Part (DSP) syntax
    dsp_syntax: DSPSyntax;
    /// The maximum length of the IDI in decimal digits
    max_idi_len_digits: number;
    /// Whether the IDI can ever be shorter than `max_idi_len_digits`
    idi_len_exact: boolean;
}

/// Table of address info about NSAP syntaxes by AFI.
///
/// This table is biased by -34, because the first 34 AFIs are not defined.
///
/// Quoting X.213:
/// "The numerically greater AFI value is used when the first significant digit
/// in the IDI is zero."

const AFI_INFO_2: Map<number, X213NetworkAddressInfo> = new Map([
    [ 34, {
        network_type: "iana_icp",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_IANA_ICP,
        idi_len_exact: true,
    } ],
    [ 35, {
        network_type: "iana_icp",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_IANA_ICP,
        idi_len_exact: true,
    } ],
    [ 36, {
        network_type: "x121",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_X121,
        idi_len_exact: false,
    } ],
    [ 37, {
        network_type: "x121",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_X121,
        idi_len_exact: false,
    } ],
    [ 38, {
        network_type: "iso_dcc",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_ISO_DCC,
        idi_len_exact: true,
    } ],
    [ 39, {
        network_type: "iso_dcc",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_ISO_DCC,
        idi_len_exact: true,
    }],
    [ 40, {
        network_type: "f69",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_F69,
        idi_len_exact: false,
    }],
    [ 41, {
        network_type: "f69",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_F69,
        idi_len_exact: false,
    }],
    [42, {
        network_type: "e163",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E163,
        idi_len_exact: false,
    }],
    [43, {
        network_type: "e163",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E163,
        idi_len_exact: false,
    }],
    [44, {
        network_type: "e164",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E164,
        idi_len_exact: false,
    }],
    [45, {
        network_type: "e164",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E164,
        idi_len_exact: false,
    }],
    [46, {
        network_type: "iso_6523_icd",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_ISO_6523_ICD,
        idi_len_exact: true,
    }],
    [47, {
        network_type: "iso_6523_icd",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_ISO_6523_ICD,
        idi_len_exact: true,
    }],
    [48, {
        network_type: "local",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_LOCAL,
        idi_len_exact: true,
    }],
    [49, {
        network_type: "local",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_LOCAL,
        idi_len_exact: true,
    }],

    // FIXME: This is missing from the Rust version.
    [50, {
        network_type: "local",
        leading_zeroes_in_idi: false,
        dsp_syntax: "iso646",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_LOCAL,
        idi_len_exact: true,
    }],

    // FIXME: This is missing from the Rust version.
    [51, {
        network_type: "local",
        leading_zeroes_in_idi: false,
        dsp_syntax: "national",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_LOCAL,
        idi_len_exact: true,
    }],

    [52, {
        network_type: "x121",
        leading_zeroes_in_idi: true,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_X121,
        idi_len_exact: false,
    }],
    [53, {
        network_type: "x121",
        leading_zeroes_in_idi: true,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_X121,
        idi_len_exact: false,
    }],
    [54, {
        network_type: "f69",
        leading_zeroes_in_idi: true,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_F69,
        idi_len_exact: false,
    }],
    [55, {
        network_type: "f69",
        leading_zeroes_in_idi: true,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_F69,
        idi_len_exact: false,
    }],
    [56, {
        network_type: "e163",
        leading_zeroes_in_idi: true,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E163,
        idi_len_exact: false,
    }],
    [57, {
        network_type: "e163",
        leading_zeroes_in_idi: true,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E163,
        idi_len_exact: false,
    }],
    [58, {
        network_type: "e164",
        leading_zeroes_in_idi: true,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E164,
        idi_len_exact: false,
    }],
    [59, {
        network_type: "e164",
        leading_zeroes_in_idi: true,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_E164,
        idi_len_exact: false,
    }],
    [76, {
        network_type: "itu_t_ind",
        leading_zeroes_in_idi: false,
        dsp_syntax: "decimal",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_ITU_T_IND,
        idi_len_exact: true,
    }],
    [77, {
        network_type: "itu_t_ind",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_ITU_T_IND,
        idi_len_exact: true,
    }],
    [0xFF, {
        network_type: "url",
        leading_zeroes_in_idi: false,
        dsp_syntax: "binary",
        max_idi_len_digits: MAX_IDI_LEN_DIGITS_URL,
        idi_len_exact: true,
    }]
]);

/// Get information about the NSAP syntax and network type by AFI
///
/// Returns `None` if the AFI is unrecognized.
export function get_nsap_address_schema(afi: AFI): X213NetworkAddressInfo | undefined {
    const normalized = group_afi_to_individual_afi(afi);
    const afi_bin = (((normalized & 0xF0) >> 4) * 10) + (normalized & 0x0F);
    if (afi_bin < 34 || afi_bin > 77) {
        return undefined;
    }
    return AFI_INFO_2.get(afi_bin);
}

/// Return get the N-address network type from the AFI
export function afi_to_network_type(afi: AFI): X213NetworkAddressType | undefined {
    return get_nsap_address_schema(afi)?.network_type;
}

/// Returns `true` if an AFI is an individual AFI
export function is_individual_afi(afi: AFI): boolean {
    let individual = group_afi_to_individual_afi(afi);
    return afi === individual;
}

/// Returns `true` if an AFI is a group AFI
export function is_group_afi(afi: AFI): boolean {
    let individual = group_afi_to_individual_afi(afi);
    return afi !== individual;
}
