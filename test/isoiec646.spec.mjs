import { describe, it } from "node:test";
import { char_to_local_iso_iec_646_byte, local_iso_iec_646_byte_to_char } from "../dist/isoiec646.mjs";
import assert from "node:assert/strict";

describe("isoiec646", () => {
    it("should convert a character to a local iso iec 646 byte", () => {
        assert.equal(char_to_local_iso_iec_646_byte("a".charCodeAt(0)), 0x65);
    });

    it("should convert a local iso iec 646 byte to a character", () => {
        assert.equal(local_iso_iec_646_byte_to_char(0x65), "a".charCodeAt(0));
    });

    it("should convert a character to a local iso iec 646 byte and back", () => {
        for (let c = " "; c <= "~"; c++) {
            const encoded = char_to_local_iso_iec_646_byte(c);
            const decoded = local_iso_iec_646_byte_to_char(encoded);
            assert.equal(decoded, c.charCodeAt(0));
        }
    });
});
