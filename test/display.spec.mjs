import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { X213NetworkAddress } from "../dist/types.mjs";
import { AFI_IANA_ICP_BIN } from "../dist/data.mjs";

describe("X213NetworkAddress.toString()", () => {
    it("should return the correct string", () => {
        const bytes = new Uint8Array([
            0x36,
            0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, // IDI = 102030405
            0x12, 0x34, 0x56, 0x78, 0x90,
        ]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.toString();
        assert.equal(result, "X121+102030405+d1234567890");
    });

    it("should print in NS+ format if the AFI is a group AFI", () => {
        const bytes = new Uint8Array([
            0xBA, // This is the group AFI equivalent of 0x36
            0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, // IDI = 102030405
            0x12, 0x34, 0x56, 0x78, 0x90,
        ]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.toString();
        assert.equal(result, "NS+BA000001020304051234567890");
    });

    // This is technically not standard behavior.
    it("should return the correct string for a URL", () => {
        const bytes = Buffer.concat([
            new Uint8Array([0xFF, 0x00, 0x01]),
            Buffer.from("https://wildboarsoftware.com/x500directory"),
        ]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.toString();
        assert.equal(result, "URL+0001+https://wildboarsoftware.com/x500directory");
    });

    it("should return the correct string for a ITOT", () => {
        const bytes = new Uint8Array([0x54, 0, 0x72, 0x87, 0x22, 3, 1, 0, 0, 0, 0, 6, 0, 0, 0x90, 0, 2]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.toString();
        assert.equal(result, "TELEX+00728722+RFC-1006+03+10.0.0.6+9+2");
    });
    
    it("should return the correct string for a IP4", () => {
        const bytes = new Uint8Array([0x36, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x12, 0x34, 0x56, 0x78, 0x90]);
        const naddr = new X213NetworkAddress(bytes);
        const result = naddr.toString();
        assert.equal(result, "X121+102030405+d1234567890");
    });

    it("should display IPv4 addresses correctly", () => {
        const bytes = new Uint8Array([
            AFI_IANA_ICP_BIN,
            0,
            1,
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
        const result = naddr.toString();
        assert.equal(result, "IP4+192.168.1.100");
    });
});
