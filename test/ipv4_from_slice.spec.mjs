import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ipv4_from_slice } from "../dist/display.mjs";

describe("ipv4_from_slice", () => {
    it("should return the correct IPv4 address", () => {
        const slice = new Uint8Array([0x19, 0x21, 0x68, 0x00, 0x11, 0x00]);
        const ipv4 = ipv4_from_slice(slice);
        assert.deepEqual(ipv4, [192, 168, 1, 100]);
    });

    it("should return undefined if the slice is too short", () => {
        const slice = new Uint8Array([0x19, 0x21, 0x68, 0x00, 0x11]);
        const ipv4 = ipv4_from_slice(slice);
        assert.equal(ipv4, undefined);
    });

    it("should return undefined if one of the ipv4 octets is greater than 255", () => {
        const slice = new Uint8Array([0x99, 0x91, 0x68, 0x00, 0x11, 0x00, 0x00]);
        const ipv4 = ipv4_from_slice(slice);
        assert.equal(ipv4, undefined);
    });
});
