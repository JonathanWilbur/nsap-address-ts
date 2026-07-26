# X.213 NSAP Library

[![JSR](https://jsr.io/badges/@wildboar/nsap-address)](https://jsr.io/@wildboar/nsap-address)

ITU-T Recommendation X.213 Network Service Access Point (NSAP) address parsing
and printing. These address types were designed for use in OSI networking, but
have full compatibility with IP networking. Since OSI networking is ancient
history, this library prioritizes the IP networking aspects, but everything
should be supported.

## This module

This module decodes and encodes a Network Service Access Point (NSAP) to and
from the "preferred binary encoding" described in Annex A, Section A.5.3 of
[ITU-T Recommendation X.213 (2001)](https://www.itu.int/rec/T-REC-X.213-200110-I/en).

In addition to this, it displays and decodes NSAPs to and from human-readable
strings according to the procedures defined in
[IETF RFC 1278](https://datatracker.ietf.org/doc/rfc1278/), drawing on
additional information found in
[IETF RFC 1277](https://datatracker.ietf.org/doc/html/rfc1277).

There are some deviations to the above, however. Since the human-friendly string
syntax was defined, new AFIs were added, including one for directly representing
IP addresses and another for representing URLs. As such this library extends the
specification, but should be completely backwards compatible with it.

You should **not** expect an NSAP decoded from a string to encode back into the
same exact string. You should **not** expect an NSAP decoded from bytes to
encode back into the same exact bytes. You should **not** expect all NSAP
syntaxes to be recognized everywhere; your application and dependencies should
handle unrecognized NSAP syntaxes gracefully.

All standard syntaxes can be both parsed ("from string") and displayed ("to string").
There is _no guarantee_ that all non-standard syntaxes can be parsed if they can be
displayed (namely, the `IP6` syntax).

Unit test coverage is close to 100% of all lines and functions, and about 70%
of branches. Some of the branches not tested are trivial error handling
branches or even thought to be unreachable. This module is written in
Typescript with the strictest settings.

This module is ESM-only. I will not publish a CommonJS version. Please consider
migrating to using ESM if you are not.

I believe this module will work on all Javascript runtimes. It does not even
depend on `Buffer` (the tests, do, though).

## Usage

Most of what you would want out of this module is parsing, printing, encoding,
decoding, and comparing NSAP addresses. Without further ado, here is a quick
showcase of this module's features:

```typescript
import { X213NetworkAddress } from "@wildboar/nsap-address";

const addr = X213NetworkAddress.fromString("PSTN+8881235050+ECMA-117-Decimal+65535+35492+128");
// s is "PSTN+8881235050+ECMA-117-Decimal+65535+35492+128"
const s = addr.toString();
// b are the bytes of the encoding described in ITU-T Rec. X.213, Annex A.
const b = addr.getOctets();
// This evaluates to true, of course. This is just a trivial byte comparison.
b.isEqualTo(b);
// 0x42 (AFI_E163_DEC_LEADING_NON_ZERO) The AFI for E.163 with no leading zero and a decimal DSP
const afi = addr.afi();
// This always converts the address to a string of the `NS+<hex>` format.
// While not user-friendly, this is the best format for interoperability.
const ns = addr.toNSString();
// idi_digits is [ 8,8,8,1,2,3,5,0,5,0 ]
const idi_digits = Array.from(addr.idiDigits() ?? []);
// dsp_digits is [ 6,5,5,3,5,3,5,4,9,2,1,2,8 ]
const dsp_digits = Array.from(addr.dspDigits() ?? []);

const addr2 = X213NetworkAddress.fromIpAddress([ 127, 0, 0, 1 ]);
const ip = addr2.getIp(); // [ 127, 0, 0, 1 ]

const addr3 = X213NetworkAddress.fromNonOsiUrl("tcp://127.0.0.1");
const url = addr3.getUrl(); // "tcp://127.0.0.1"
```

There is sort of a "mini-database" of NSAP AFI's / network types, etc. You can
use it like so:

```typescript
import {
    get_nsap_address_schema,
    afi_to_network_type,
    is_individual_afi,
    is_group_afi,
    group_afi_to_individual_afi,
} from "@wildboar/nsap-address/data";

const afi = 0x58;
const schema = get_nsap_address_schema(afi);
schema.network_type; // "e164"
schema.leading_zeroes_in_idi; // true
schema.dsp_syntax; // "decimal"
schema.max_idi_len_digits; // 15
schema.idi_len_exact; // false
afi_to_network_type(afi); // "e164"
is_individual_afi(afi); // true
is_group_afi(afi); // false
group_afi_to_individual_afi(afi) === afi; // true
```

## AI Usage Statement

Most of the code in this repository is based off of a Rust equivalent of this
library, which is currently located
[here](https://github.com/JonathanWilbur/asn1.rs/blob/master/nsap-address/README.md)
(but this will change). The code was manually transliterated from Rust to
Typescript by a human (your truly), but with a lot of assistance from the Cursor
IDE. I think about six unit tests related to parsing were written exclusively by
AI. I don't know what you would consider this, but I would say this module
counts as "not written by AI" overall.

## Deviations from IETF RFC 1278

- `ICP` and `IND` AFIs recognized in the `<afi>-<idi>-<dsp>` syntax
- `IP4`, `IP6`, and `URL` schemes supported in `FromStr` and `Display`
- Zero-length IDI tolerated in parsed strings when using the `LOCAL` syntax

## To Do (Future)

- [ ] Support [GOSIP NSAP addressing](https://medium.com/@jacstech/jacs-nsap-structure-8cb9a809228b)

## Note

I think there is an error in IETF RFC 1278: it specifies a special AFI syntax for
`LOCAL` AFIs, but this syntax requires at least one digit for the IDI and ITU-T
Recommendation X.213 says that the Local AFI uses zero digits for the IDI.
