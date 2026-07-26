import { describe, it } from "node:test";
import assert from "node:assert";
import X213NetworkAddress from "../dist/types.mjs";
import { AFI_E163_DEC_LEADING_NON_ZERO, AFI_IANA_ICP_BIN, AFI_ISO_DCC_BIN, AFI_E163_DEC_LEADING_ZERO } from "../dist/data.mjs";

describe("parsing", () => {
    // Example from RFC 1278
    it("should parse the NS syntax", () => {
        const addr = X213NetworkAddress.fromString("NS+a433bb93c1");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0xa4, 0x33, 0xbb, 0x93, 0xc1]));
    });

    // Example from RFC 1278
    it("should parse the X121 syntax with no dsp", () => {
        const addr = X213NetworkAddress.fromString("X121+234219200300");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        // 0x37 is the binary no-leading-zeroes + decimal DSP AFI
        assert.deepEqual(addr.bytes, new Uint8Array([0x36, 0x00, 0x23, 0x42, 0x19, 0x20, 0x03, 0x00]));
    });

    it("should parse a decimal dsp", () => {
        const addr = X213NetworkAddress.fromString("X121+234219200300+d123456");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        // 0x37 is the no-leading-zeroes + decimal DSP AFI
        assert.deepEqual(addr.bytes, new Uint8Array([0x36, 0x00, 0x23, 0x42, 0x19, 0x20, 0x03, 0x00, 0x12, 0x34, 0x56]));
    });

    it("should parse idp+dsp syntax", () => {
        const addr = X213NetworkAddress.fromString("36234219200300+123456");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        // 0x37 is the no-leading-zeroes + decimal DSP AFI
        assert.deepEqual(addr.bytes, new Uint8Array([0x36, 0x00, 0x23, 0x42, 0x19, 0x20, 0x03, 0x00, 0x12, 0x34, 0x56]));
    });

    it("should parse a binary dsp", () => {
        const addr = X213NetworkAddress.fromString("X121+234219200300+x01020304");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        // 0x37 is the no-leading-zeroes + binary DSP AFI
        assert.deepEqual(addr.bytes, new Uint8Array([0x37, 0x00, 0x23, 0x42, 0x19, 0x20, 0x03, 0x00, 0x01, 0x02, 0x03, 0x04]));
    });

    // NOTE: This syntax is a deviation. IETF RFC 1278 technically forbids a
    // zero-length IDI for the local characters syntax, but the local AFI itself
    // requires an empty IDI.
    it("should parse a textual dsp", () => {
        const addr = X213NetworkAddress.fromString("LOCAL++lasdf");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        // 0x50 is the ISO/IEC 646 local DSP AFI, which is the only one defined that supports textual DSPs
        assert.deepEqual(addr.bytes, new Uint8Array([0x50, 0x65, 0x83, 0x68, 0x70]));
    });

    // Example from RFC 1278
    it("should parse the TELEX syntax", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0x54, 0x00, 0x72, 0x87, 0x22, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x06]));
    });

    it("should parse the RFC-1006 syntax with a port", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+65535");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0x54, 0x00, 0x72, 0x87, 0x22, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x06, 0x65, 0x53, 0x5F]));
    });

    it("should parse the RFC-1006 syntax with a port and tset", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+65535+65534");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0x54, 0x00, 0x72, 0x87, 0x22, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x06, 0x65, 0x53, 0x56, 0x55, 0x34]));
    });

    it("should fail to parse RFC-1006 with a prefix that is too short", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+3+10.0.0.6");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a prefix that is too long", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+033+10.0.0.6");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a non-digit prefix", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+0A+10.0.0.6");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a malformed IPv4 address", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with an empty port", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6++2");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with an empty tset", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+9+");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a non-numeric port", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+abc");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a non-numeric tset", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+9+abc");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a port that is too large", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+65536");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a negative port", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+-1");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a tset that is too large", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+9+65536");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse RFC-1006 with a negative tset", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+RFC-1006+03+10.0.0.6+9+-1");
        assert.equal(addr, "malformed");
    });

    // Example from RFC 1278
    // This one deviates from RFC 1278. It seems like it had quotes
    // around the CUDF in error. I am not totally sure.
    it("should parse the X.25 DSP syntax using a CUDF", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+00002340555+CUDF+892796");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0x54, 0x00, 0x72, 0x87, 0x22, 0x02, 0x23, 0x13, 0x70, 0x39, 0x15, 0x00, 0x00, 0x02, 0x34, 0x05, 0x55]));
    });

    it("should parse the X.25 DSP syntax using a PID", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+00002340555+PID+892796");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0x54, 0x00, 0x72, 0x87, 0x22, 0x02, 0x13, 0x13, 0x70, 0x39, 0x15, 0x00, 0x00, 0x02, 0x34, 0x05, 0x55]));
    });

    it("should fail to parse the X.25 DSP syntax using a malformed PID (odd hex digits)", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+00002340555+PID+89279");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse the X.25 DSP syntax with too many parts", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+00002340555+CUDF+892796+452975");
        assert.equal(addr, "malformed");
    });

    it("should fail to parse the X.25 DSP syntax with invalid syntax", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+00002340555+NONCUDF+892796");
        assert.equal(addr, "malformed");
    });

    it("should parse the X.25 DSP syntax with DTE-only", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+123");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0x54, 0x00, 0x72, 0x87, 0x22, 0x02, 0x01, 0x23]));
    });

    it("should fail to parse an excessively long X.25 DSP syntax with DTE-only", () => {
        const addr = X213NetworkAddress.fromString("TELEX+00728722+X.25(80)+02+12352058028502058250020850820850");
        assert.equal(addr, "malformed");
    });

    it("should parse the non-standard X.519 URL syntax", () => {
        const addr = X213NetworkAddress.fromString("URL+001+https://asdf.com");
        const urlEncoded = new TextEncoder().encode("https://asdf.com");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([0xFF, 0x00, 0x01, ...urlEncoded]));
    });

    it("should parse the non-standard IP4 syntax", () => {
        const addr = X213NetworkAddress.fromString("IP4+192.168.1.100");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([AFI_IANA_ICP_BIN, 0x00, 0x01, 0xC0, 0xA8, 0x01, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    });

    // Max IDI digits is 4 for ICD-family addresses. So 23452 is problematic in this case.
    it("should return a malformed error for an address with too many IDI digits", () => {
        const addr = X213NetworkAddress.fromString("ICD+23452+x0824");
        assert.equal(addr, "malformed");
    });

    it("should return a malformed error for an address with a non-digit IDI", () => {
        const addr = X213NetworkAddress.fromString("ICD+23F3+x0824");
        assert.equal(addr, "malformed");
    });

    // I think this was based off of a regression.
    it("should parse the DCC syntax correctly", () => {
        const addr = X213NetworkAddress.fromString("DCC+840+x0824");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([AFI_ISO_DCC_BIN, 0x84, 0x0F, 0x08, 0x24]));
    });

    it("should parse the ecma-117 binary syntax correctly", () => {
        const addr = X213NetworkAddress.fromString("DCC+840+ECMA-117-Binary+dead+deadbeefcafe+ab");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([AFI_ISO_DCC_BIN, 0x84, 0x0F, 0xDE, 0xAD, 0xDE, 0xAD, 0xBE, 0xEF, 0xCA, 0xFE, 0xAB]));
    });

    it("should parse the ecma-117 decimal syntax correctly", () => {
        const addr = X213NetworkAddress.fromString("PSTN+8881235050+ECMA-117-Decimal+65535+35492+128");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        // NOTE: The 0x00 after the AFI is IDI padding added automatically.
        // The next test will demonstrate that this byte flips to 0x11 when
        // you change the first digit of the IDI from 8 to 0.
        assert.deepEqual(addr.bytes, new Uint8Array([AFI_E163_DEC_LEADING_NON_ZERO, 0x00, 0x88, 0x81, 0x23, 0x50, 0x50, 0x65, 0x53, 0x53, 0x54, 0x92, 0x12, 0x8F ]));
    });

    it("should pad decimal dsps with leading ones if the dsp starts with zeroes", () => {
        const addr = X213NetworkAddress.fromString("PSTN+0881235050+ECMA-117-Decimal+65535+35492+128");
        assert.notEqual(typeof addr, "string", `Error was ${addr}`);
        assert.deepEqual(addr.bytes, new Uint8Array([AFI_E163_DEC_LEADING_ZERO, 0x11, 0x08, 0x81, 0x23, 0x50, 0x50, 0x65, 0x53, 0x53, 0x54, 0x92, 0x12, 0x8F ]));
    });

    it("should detect malformed ecma-117 binary syntax", () => {
        const addr = X213NetworkAddress.fromString("DCC+840+ECMA-117-Binary+be+deadbeefcafe+ab");
        assert.equal(addr, "malformed");
    });

    it("should detect malformed ecma-117 decimal syntax", () => {
        const addr = X213NetworkAddress.fromString("PSTN+8881235050+ECMA-117-Decimal+1+35492+128");
        assert.equal(addr, "malformed");
    });
});
