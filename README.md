# X.213 NSAP Library

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
branches or even thought to be unreachable.

## Usage

TODO: Fill in

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
