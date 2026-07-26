import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BCDBuffer } from "../dist/bcd.mjs";

describe("BCDBuffer", () => {
    it("should create a new BCDBuffer", () => {
        const bcd = new BCDBuffer();
        assert.equal(bcd.len_in_bytes(), 0);
    });

    it("should push a digit", () => {
        const bcd = new BCDBuffer();
        bcd.push_digit_u8(0x39);
        assert.equal(bcd.len_in_bytes(), 1);
        assert.deepEqual(bcd.as_ref(), new Uint8Array([0x9F]));
    });

    it("should push a string", () => {
        const bcd = new BCDBuffer();
        bcd.push_str("97531");
        assert.equal(bcd.len_in_bytes(), 3);
        assert.deepEqual(bcd.as_ref(), new Uint8Array([0x97, 0x53, 0x1F]));
    });

    it("should push a byte", () => {
        const bcd = new BCDBuffer();
        bcd.push_byte(0x33);
        assert.equal(bcd.len_in_bytes(), 1);
        assert.deepEqual(bcd.as_ref(), new Uint8Array([0x33]));
    });

    it("should push a nybble", () => {
        const bcd = new BCDBuffer();
        bcd.push_nybble(5);
        assert.equal(bcd.len_in_bytes(), 1);
        assert.deepEqual(bcd.as_ref(), new Uint8Array([0x5F]));
    });

    it("works with a complicated example", () => {
        const bcd = new BCDBuffer();
        assert.equal(bcd.len_in_bytes(), 0);
        bcd.push_digit_u8(0x39);
        assert.equal(bcd.len_in_bytes(), 1);
        bcd.push_digit_u8(0x37);
        assert.equal(bcd.len_in_bytes(), 1);
        bcd.push_nybble(0x05);
        assert.equal(bcd.len_in_bytes(), 2);
        bcd.push_byte(0x33);
        assert.equal(bcd.len_in_bytes(), 3);
        assert.deepEqual(bcd.as_ref(), new Uint8Array([0x97, 0x50, 0x33]));
        assert.equal(bcd.len_in_bytes(), 3);

        const digits = Array.from(bcd.iter_digits());
        assert.deepEqual(digits, [9, 7, 5, 0, 3, 3]);
    });

    it("works with another complicated example", () => {
        const bcd = new BCDBuffer();
        assert.equal(bcd.len_in_bytes(), 0);
        bcd.push_digit_u8(0x39);
        assert.equal(bcd.len_in_bytes(), 1);
        bcd.push_ascii_bytes(new Uint8Array([0x37, 0x35]));
        assert.equal(bcd.len_in_bytes(), 2);
        bcd.push_str("31");
        assert.equal(bcd.len_in_bytes(), 3);
        bcd.push_nybble(0xF);
        assert.equal(bcd.len_in_bytes(), 3);
        assert.deepEqual(bcd.as_ref(), new Uint8Array([0x97, 0x53, 0x1F]));
        assert.equal(bcd.len_in_bytes(), 3);

        const digits = Array.from(bcd.iter_digits());
        assert.deepEqual(digits, [9, 7, 5, 3, 1]);
    });
});
