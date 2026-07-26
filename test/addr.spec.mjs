import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { X213NetworkAddress } from "../dist/types.mjs";
import {
    ITOT_OVER_IPV4_DEFAULT_PORT,
    DEFAULT_ITOT_TRANSPORT_SET,
    AFI_IANA_ICP_BIN,
    AFI_ISO_DCC_DEC,
} from "../dist/data.mjs";

describe("X213NetworkAddress", () => {

    it("constructor throws with a zero-length nsap", () => {
        assert.throws(() => {
            new X213NetworkAddress(new Uint8Array([]));
        });
    });

    it("return the correct network type from get_network_type()", () => {
        const addr = new X213NetworkAddress(new Uint8Array([0x36, 0x00, 0x23, 0x42, 0x19, 0x20, 0x03, 0x00]));
        assert.equal(addr.afi(), 0x36);
        assert.equal(addr.get_network_type(), "x121");
    });

    it("should return the correct RFC-1277 socket info from get_rfc1277_socket()", () => {
        const bytes = new Uint8Array([0x54, 0, 0x72, 0x87, 0x22, 3, 1, 0, 0, 0, 0, 6, 0, 0, 0x90, 0, 2]);
        const naddr = new X213NetworkAddress(bytes);
        const info = naddr.get_rfc1277_socket();
        assert.ok(info);
        const [ network, ip, port, tset ] = info;
        assert.equal(network, 3);
        assert.deepEqual(ip, [10, 0, 0, 6]);
        assert.equal(port, 9);
        assert.equal(tset, 2);
    });

    it("should not return dsp_digits if the dsp syntax is not decimal", () => {
        const bytes = new Uint8Array([
            AFI_IANA_ICP_BIN,
            0,
            2,
            192,
            168,
            1,
            100,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ]);
        const naddr = new X213NetworkAddress(bytes);
        const dsp_digits = naddr.dsp_digits();
        assert.ok(!dsp_digits);
    });

    it("should not return dsp_digits if the afi is unrecognized", () => {
        const bytes = new Uint8Array([ 0xFE, 1, 2, 3 ]);
        const naddr = new X213NetworkAddress(bytes);
        const dsp_digits = naddr.dsp_digits();
        assert.ok(!dsp_digits);
    });

    it("should return the correct ipv4 address", () => {
        const naddr = X213NetworkAddress.from_ipv4([255, 0, 10, 88]);
        const ip = naddr.get_ip();
        assert.deepEqual(ip, [255, 0, 10, 88]);
    });

    it("should return the correct ipv6 address", () => {
        const bytes = new Uint8Array([0x54, 0, 0x72, 0x87, 0x22, 3, 1, 0, 0, 0, 0, 6, 0, 0, 0x90, 0, 2]);
        const input = [
            0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
            0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x00,
        ];
        const naddr = X213NetworkAddress.from_ipv6(input);
        const output = naddr.get_ip();
        assert.deepEqual(output, input);
        assert.equal(naddr.toString(), "IP6+1122:3344:5566:7788:99AA:BBCC:DDEE:FF00");
    });

    it("should return undefined from get_ip if the ip type is not recognized", () => {
        const bytes = new Uint8Array([
            AFI_IANA_ICP_BIN,
            0,
            2,
            192,
            168,
            1,
            100,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.get_ip();
        assert.equal(result, undefined);
    });

    it("should return undefined from get_ip if the nsap length is not 20", () => {
        const bytes = new Uint8Array([
            AFI_IANA_ICP_BIN,
            0,
            2,
            192,
            168,
            1,
            100,
        ]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.get_ip();
        assert.equal(result, undefined);
    });

    it("should return the correct url", () => {
        const url = "https://wildboarsoftware.com/x500directory";

        const naddr1 = X213NetworkAddress.from_itot_url(url);
        const output1 = naddr1.get_url();
        assert.deepEqual(output1, url);

        const naddr2 = X213NetworkAddress.from_non_osi_url(url);
        const output2 = naddr2.get_url();
        assert.deepEqual(output2, url);
    });

    it("should fail to return a url from get_url if the nsap length is too short", () => {
        const url = "https://wildboarsoftware.com/x500directory";
        const naddr1 = new X213NetworkAddress(new Uint8Array([0xFF, 0x00, 0x01, 0x65]));
        const output1 = naddr1.get_url();
        assert.equal(output1, undefined);
    });

    it("should return network socket info with port but no transport set", () => {
        const naddr = X213NetworkAddress.from_socket_addr_v4(3, [0xFF, 11, 0, 128], 65535);
        const info = naddr.get_rfc1277_socket();
        assert.ok(info);
        const [ network, ip, port, tset ] = info;
        assert.equal(network, 3);
        assert.deepEqual(ip, [0xFF, 11, 0, 128]);
        assert.equal(port, 65535);
        assert.equal(tset, DEFAULT_ITOT_TRANSPORT_SET);
    });

    it("should return network socket info with no port nor transport set", () => {
        const naddr = X213NetworkAddress.from_socket_addr_v4(3, [0xFF, 11, 0, 128]);
        const info = naddr.get_rfc1277_socket();
        assert.ok(info);
        const [ network, ip, port, tset ] = info;
        assert.equal(network, 3);
        assert.deepEqual(ip, [0xFF, 11, 0, 128]);
        assert.equal(port, ITOT_OVER_IPV4_DEFAULT_PORT);
        assert.equal(tset, DEFAULT_ITOT_TRANSPORT_SET);
    });

    it("should not return network socket info if the nsap has a short dsp", () => {
        const naddr = X213NetworkAddress.from_socket_addr_v4(3, [0xFF, 11, 0, 128]);
        const naddr2 = new X213NetworkAddress(naddr.bytes.subarray(0, naddr.bytes.length - 1));
        const info = naddr2.get_rfc1277_socket();
        assert.ok(!info);
    });

    it("should not return network socket info if it does not start with the ietf rfc 1277 prefix", () => {
        const naddr = X213NetworkAddress.from_socket_addr_v4(3, [0xFF, 11, 0, 128]);
        const naddr2 = new X213NetworkAddress(naddr.bytes.subarray(1));
        const info = naddr2.get_rfc1277_socket();
        assert.ok(!info);
    });

    // TODO: Port this to the Rust crate. This is an extremely important test case.
    it("idi_digits() should return the correct digits when an odd-length idi is used with a decimal dsp", () => {
        // The ISO-DCC AFI was chosen because it uses exactly 3 digits in the IDI.
        // When a decimal DSP is used, its first digit should be the least
        // significant nybble in the same byte whose most significant nybble is
        // the last digit of the IDI. We therefore want to ensure that idi_digits()
        // does not mistakenly include the DSP digit from this shared byte.
        const addr = X213NetworkAddress.fromString("DCC+840+d1234");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([AFI_ISO_DCC_DEC, 0x84, 0x01, 0x23, 0x4F]));
        const idi_digits = Array.from(addr.idi_digits());
        const dsp_digits = Array.from(addr.dsp_digits());
        assert.deepEqual(idi_digits, [8, 4, 0]);
        assert.deepEqual(dsp_digits, [1, 2, 3, 4]);
    });
});
