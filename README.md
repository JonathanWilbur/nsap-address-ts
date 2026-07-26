


All standard syntaxes can be both parsed ("from string") and displayed ("to string").
There is _no guarantee_ that all non-standard syntaxes can be parsed if they can be
displayed (namely, the `IP6` syntax).

- [ ] Formatting
- [ ] `index.mts`
- [ ] AI / LLM statement
- [ ] Make `fromHex` return `null` on error?
- [ ] Convert Rust documentation comments to JSDoc
- [ ] Make IPv4 or IPv6 a `Uint8Array`
- [ ] Break from digits iteration on any nybble above 9

## Note

I think there is an error in IETF RFC 1278: it specifies a special AFI syntax for
`LOCAL` AFIs, but this syntax requires at least one digit for the IDI and ITU-T
Recommendation X.213 says that the Local AFI uses zero digits for the IDI.
