import {
    AFI_STR_DCC, AFI_STR_ICD, AFI_STR_ICP, AFI_STR_IND, AFI_STR_ISDN, AFI_STR_LOCAL, AFI_STR_PSTN,
    AFI_STR_TELEX, AFI_STR_URL, AFI_STR_X121, ITOT_OVER_IPV4_DEFAULT_PORT,
    ITU_X519_DSP_PREFIX_IDM_OVER_IPV4, ITU_X519_DSP_PREFIX_LDAP, RFC_1277_PREFIX,
    RFC_1277_WELL_KNOWN_NETWORK_DARPA_NSF_INTERNET, is_group_afi,
    AFI_IANA_ICP_BIN, AFI_URL, IANA_ICP_IDI_IPV4, IANA_ICP_IDI_IPV6,
    DEFAULT_ITOT_TRANSPORT_SET,
    type X213NetworkAddressInfo,
} from "./data.mjs";
import { local_iso_iec_646_byte_to_char } from "./isoiec646.mjs";
import type {
    X213NetworkAddress,
    X213NetworkAddressType,
    Ipv4Address,
} from "./types.mjs";
import { uint8ArrayCompare } from "./utils.mjs";

const naddr_network_type_to_str_map = new Map<X213NetworkAddressType, string>([
    ["x121", AFI_STR_X121],
    ["iso_dcc", AFI_STR_DCC],
    ["f69", AFI_STR_TELEX],
    ["e163", AFI_STR_PSTN],
    ["e164", AFI_STR_ISDN],
    ["iso_6523_icd", AFI_STR_ICD],
    ["iana_icp", AFI_STR_ICP],
    ["itu_t_ind", AFI_STR_IND],
    ["local", AFI_STR_LOCAL],
    ["url", AFI_STR_URL],
]);

/** Convert the network type to a string */
export function naddr_network_type_to_str(nt: X213NetworkAddressType): string | undefined {
    return naddr_network_type_to_str_map.get(nt);
}

/** Decode a BCD-encoded IPv4 address. Returns `None` upon integer overflow. */
export function ipv4_from_slice(bytes: Uint8Array): Ipv4Address | undefined {
    const byte0 = bytes[0];
    const byte1 = bytes[1];
    const byte2 = bytes[2];
    const byte3 = bytes[3];
    const byte4 = bytes[4];
    const byte5 = bytes[5];
    if (
        typeof byte0 !== "number"
        || typeof byte1 !== "number"
        || typeof byte2 !== "number"
        || typeof byte3 !== "number"
        || typeof byte4 !== "number"
        || typeof byte5 !== "number"
    ) {
        return undefined;
    }
    const oct1 = (((byte0 & 0xF0) >> 4) * 100)
        + (((byte0 & 0x0F) >> 0) * 10)
        + (((byte1 & 0xF0) >> 4) * 1);
    const oct2 = (((byte1 & 0x0F) >> 0) * 100)
        + (((byte2 & 0xF0) >> 4) * 10)
        + (((byte2 & 0x0F) >> 0) * 1);
    const oct3 = (((byte3 & 0xF0) >> 4) * 100)
        + (((byte3 & 0x0F) >> 0) * 10)
        + (((byte4 & 0xF0) >> 4) * 1);
    const oct4 = (((byte4 & 0x0F) >> 0) * 100)
        + (((byte5 & 0xF0) >> 4) * 10)
        + (((byte5 & 0x0F) >> 0) * 1);
    if (oct1 > 255 || oct2 > 255 || oct3 > 255 || oct4 > 255) {
        return undefined;
    }
    return [oct1, oct2, oct3, oct4];
}

// TODO: JSDoc
// TODO: Expose only_standard flag
export function fmt_naddr(
    naddr: X213NetworkAddress,
    only_standard: boolean = false,
): string {
    if (!only_standard && (naddr.bytes[0] === AFI_URL)) {
        const url = new TextDecoder().decode(naddr.bytes.slice(3));
        if (
            !url.includes('_')
            && typeof naddr.bytes[1] === "number"
            && typeof naddr.bytes[2] === "number"
        ) {
            // FIXME: Actually... should you encode the IDI as hex?
            const idihex1 = naddr.bytes[1].toString(16).toUpperCase().padStart(2, '0');
            const idihex2 = naddr.bytes[2].toString(16).toUpperCase().padStart(2, '0');
            return `URL+${idihex1}${idihex2}+${url}`;
        }
    }
    const octets = naddr.bytes;
    if (!only_standard && octets[0] == AFI_IANA_ICP_BIN && octets.length == 20) {
        const icp = octets.subarray(1, 3);
        if ((icp[0] === IANA_ICP_IDI_IPV6[0]) && (icp[1] === IANA_ICP_IDI_IPV6[1])) {
            const h = Array.from(octets)
                .slice(3, 19)
                .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
                ;
            // Only split in two for line length reasons.
            const s1 = `${h[0]}${h[1]}:${h[2]}${h[3]}:${h[4]}${h[5]}:${h[6]}${h[7]}`;
            const s2 = `${h[8]}${h[9]}:${h[10]}${h[11]}:${h[12]}${h[13]}:${h[14]}${h[15]}`;
            return `IP6+${s1}:${s2}`;
        }
        if ((icp[0] === IANA_ICP_IDI_IPV4[0]) && (icp[1] === IANA_ICP_IDI_IPV4[1])) {
            return `IP4+${octets[3]}.${octets[4]}.${octets[5]}.${octets[6]}`;
        }
    }
    const is_rfc1278_ip: boolean = uint8ArrayCompare(
            octets.slice(0, RFC_1277_PREFIX.length),
            new Uint8Array(RFC_1277_PREFIX)
        )
        && (octets.length >= (RFC_1277_PREFIX.length + 7))
        && [
            RFC_1277_WELL_KNOWN_NETWORK_DARPA_NSF_INTERNET,
            ITU_X519_DSP_PREFIX_IDM_OVER_IPV4,
            ITU_X519_DSP_PREFIX_LDAP,
        ].includes(octets[5]!);
    if (is_rfc1278_ip) {
        const ip_and_stuff = octets.subarray(RFC_1277_PREFIX.length + 1);
        const ip = ipv4_from_slice(ip_and_stuff.subarray(0, 6));
        const port: number = (octets.length >= RFC_1277_PREFIX.length + 1 + 6 + 3)
            ? (((ip_and_stuff[6]! & 0xF0) >> 4) * 10000)
                + (((ip_and_stuff[6]! & 0x0F) >> 0) * 1000)
                + (((ip_and_stuff[7]! & 0xF0) >> 4) * 100)
                + (((ip_and_stuff[7]! & 0x0F) >> 0) * 10)
                + (((ip_and_stuff[8]! & 0xF0) >> 4) * 1)
            : ITOT_OVER_IPV4_DEFAULT_PORT
            ;
        const tset: number = (octets.length >= RFC_1277_PREFIX.length + 1 + 6 + 5)
            ? (((ip_and_stuff[8]! & 0x0F) >> 0) * 10000)
                + (((ip_and_stuff[9]! & 0xF0) >> 4) * 1000)
                + (((ip_and_stuff[9]! & 0x0F) >> 0) * 100)
                + (((ip_and_stuff[10]! & 0xF0) >> 4) * 10)
                + (((ip_and_stuff[10]! & 0x0F) >> 0) * 1)
            : DEFAULT_ITOT_TRANSPORT_SET
            ;
        // let port: u16 = port.try_into().unwrap_or(0);
        // let tset: u16 = tset.try_into().unwrap_or(DEFAULT_ITOT_TRANSPORT_SET);
        if (ip) {
            let out = "TELEX+00728722+RFC-1006+03+" + ip.join(".");
            if (port != ITOT_OVER_IPV4_DEFAULT_PORT) {
                out += `+${port}`;
            }
            if (tset != DEFAULT_ITOT_TRANSPORT_SET) {
                out += `+${tset}`;
            }
            return out;
        }
    }
    const info: X213NetworkAddressInfo | undefined = naddr.get_network_type_info();
    const idi_digits = naddr.idi_digits();
    if (!info || !idi_digits) {
        return naddr.to_ns_string();
    }
    const is_non_standard: boolean = (
        (info.network_type === "url")
        || (info.network_type === "iana_icp")
        || (info.network_type === "itu_t_ind")
    );
    
    /* We don't display group AFIs using the <afi>+<idi>+<dsp> syntax because it
    is ambiguous what the underlying AFI is for <afi>. I think the sensible
    conclusion is that <afi> always refers to the individual AFI, so we use the
    NS+<hex> syntax whenever the group AFI is used to clear any ambiguity. */
    let cant_display: boolean =
        (is_non_standard && !(only_standard)) || is_group_afi(naddr.afi());
    if (cant_display) {
        return naddr.to_ns_string();
    }
    let out = naddr_network_type_to_str(info.network_type) + "+";
    for (const digit of idi_digits) {
        out += digit.toString();
    }
    out += "+";
    const idi_len = info.max_idi_len_digits;
    const idi_len_in_bytes = idi_len >> 1;
    if (info.dsp_syntax === "decimal") {
        const dsp_digits = naddr.dsp_digits();
        if (!dsp_digits) {
            // This shouldn't happen
            out += "x";
            out += Array.from(naddr.get_octets())
                .slice(1 + idi_len_in_bytes)
                .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
                .join("")
                ;
            return out;
        }
        out += "d";
        for (const digit of dsp_digits) {
            out += String.fromCharCode(digit + 0x30);
        }
    } else if (info.dsp_syntax === "binary" || info.dsp_syntax === "national") {
        const dsp = naddr.get_octets().subarray(1 + idi_len_in_bytes);
        out += "x";
        for (const byte of dsp) {
            out += byte.toString(16).toUpperCase().padStart(2, "0");
        }
    } else if (info.dsp_syntax === "iso646") {
        const dsp = naddr.get_octets().subarray(1 + idi_len_in_bytes);
        const decoded = Array.from(dsp)
            .map((b) => local_iso_iec_646_byte_to_char(b))
            .join("")
            ;
        out += decoded;
    }
    return out;
}
