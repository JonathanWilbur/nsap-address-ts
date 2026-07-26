/**
 * Binary-Coded Decimal (BCD) handling
 *
 * This isn't generally useful for all uses cases: this is specifically
 * designed for X.213 NSAP addresses
 * 
 * @module bcd
 */

/**
 * Buffer for writing Binary-Coded Decimal (BCD)
 *
 * Binary-Coded Decimal (BCD) is extensively used by X.213 NSAP addresses. It
 * is always used for the Initial Domain Identifier (IDI), but is often used
 * for the Domain Specific Part (DSP) as well.
 *
 * This uses a fixed-length buffer of 20 bytes, because NSAP addresses are
 * forbidden from exceeding 20 bytes, with an exception for URLs established in
 * ITU-T Rec. X.519. Despite this one exception, no decimal encoding of an NSAP
 * address exceeds 20 bytes.
 */
export class BCDBuffer {
    bytes: Uint8Array;
    i: number;

    constructor(bytes?: Uint8Array) {
        this.bytes = bytes ?? new Uint8Array(20);
        if (!bytes) {
            this.bytes.fill(0xFF);
        }
        this.i = bytes
            ? (bytes.length * 2)
            : 0;
    }

    /**
     * Push a string of ASCII digits to the BCD buffer.
     */
    public push_str(s: string) {
        for (let i = 0; i < s.length; i++) {
            this.push_digit_u8(s.charCodeAt(i));
        }
    }

    /**
     * Push a u8 slice of ASCII digits to the BCD buffer.
     */
    public push_ascii_bytes(bytes: Uint8Array) {
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i]!;
            this.push_digit_u8(byte);
        }
    }

    /**
     * Push a single ASCII digit into the BCD buffer.
     */
    public push_digit_u8(b: number) {
        const nybble: number = Math.max(0, b - 0x30);
        this.push_nybble(nybble);
    }

    /**
     * Push an arbitrary nybble into the BCD buffer
     *
     * This does not check if the nybble is a binary-coded decimal.
     * This is particularly useful for pushing the padding nybble `0b1111`
     * that is used to pad an odd number of digits to an integral number of
     * octets.
     */
    public push_nybble(n: number) {
        let byte_index = this.i >> 1;
        if (typeof this.bytes[byte_index] === "undefined") {
            throw new Error("BCD buffer is full");
        }
        if ((this.i % 2) > 0) {
            // least significant nybble
            // TODO: Review this addition in my Rust equivalent. Why didn't I have to do this there?
            // I have more unit tests for this here, so consider adding these to the Rust equivalent.
            this.bytes[byte_index] &= 0xF0;
            this.bytes[byte_index] |= n;
        } else {
            this.bytes[byte_index] = ((n << 4) | 0x0F);
        }
        this.i += 1;
        this.i = Math.min(39, this.i);
    }

    /**
     * Push a full byte into the BCD buffer
     *
     * If the last nybble prior to pushing is unset, it stays unset at 0.
     *
     * In other words, if the buffer contains `012` and you use this function
     * to push `0x34`, the BCD buffer will then contain `012034`.
     */
    public push_byte(byte: number) {
        let byte_index = this.len_in_bytes();
        this.bytes[byte_index] = byte;
        if (
            ((this.i % 2) > 0)
            && (typeof this.bytes[byte_index - 1] !== "undefined")
        ) {
            this.bytes[byte_index - 1]! &= 0xF0;
        }
        this.i += ((this.i % 2) > 0) ? 3 : 2;
        this.i = Math.min(39, this.i);
    }

    /** Get the length of the BCD in bytes. */
    public len_in_bytes(): number {
        return ((this.i >> 1) + (this.i % 2));
    }

    /**
     * Returns the BCD bytes. Use this function to obtain the output of the
     * BCD buffer.
     */
    public as_ref(): Uint8Array {
        return this.bytes.subarray(0, this.len_in_bytes());
    }

    // public size_hint(): [ number, number | undefined ] {
    //     let max_digits = this.bytes.length << 1; // Double it
    //     if (this.least_sig_nybble) {
    //         max_digits = Math.max(0, max_digits - 1);
    //     }
    //     if (this.ignore_last_nybble) {
    //         max_digits = Math.max(0, max_digits - 1);
    //     }
    //     // Every digit could be a leading digit
    //     return [0, max_digits];
    // }

    // FIXME: The Rust type is ShouldBeASCIIDigit, but I don't think that is accurate.
    /**
     * @summary Iterate over the digits in the BCD buffer.
     * @param least_sig_nybble Whether to start with the least significant
     *  nybble of the first byte instead of the most significant nybble.
     * @param leading_0_sig Whether to treat a leading 0 as a significant
     *  digit, if `true`, we skip over leading 0x1 nybbles.
     * @param ignore_last_nybble Whether to ignore the last nybble
     * @param processing_leading_digits Whether to process leading digits;
     *  if `false`, we assume there are no leading digits in the buffer.
     * @returns An iterator over the digits, as ASCII code points.
     * @function
     */
    public *iter_digits(
        least_sig_nybble: boolean = false,
        leading_0_sig: boolean = true,
        ignore_last_nybble: boolean = false,
        // TODO: Review. This is set to false in the Rust equivalent.
        processing_leading_digits: boolean = true,
    ): IterableIterator<number, void>  {
        const leading_digit: number = leading_0_sig ? 1 : 0;
        const len = this.len_in_bytes();
        let i = 0;
        while (i < len) {
            const byte = this.bytes[i]!;
            const nybble = least_sig_nybble
                ? (byte & 0b0000_1111)
                : ((byte & 0b1111_0000) >> 4);
            if (least_sig_nybble) {
                // Each iteration of this while loop returns only one nybble,
                // so we only move to the next byte on every other iteration.
                i += 1;
            }
            least_sig_nybble = !least_sig_nybble;
            if (processing_leading_digits) {
                if (nybble === leading_digit) {
                    continue;
                } else {
                    processing_leading_digits = false;
                }
            }
            // If the last nybble is 0b1111, it is padding.
            if ((nybble === 0b1111) || ignore_last_nybble) {
                // FIXME: ignore_last_nybble is not handled correctly.
                return;
            }
            yield nybble;
        }
    }
}
