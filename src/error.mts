// TODO: Some of these variants are no longer used. Find out why.
// TODO: Move variant docs to the type definition.

/** An error parsing an NSAP address from bytes */
export type NAddressParseError =
    /** The NSAP address was too short / truncated */
    | "too_short"
    /** The NSAP address was too long */
    | "too_long"
    /** The DSP was malformed */
    | "malformed_dsp"
    /** The IDI contained non-digits */
    | "non_digits_in_idi"
    // TODO: Add more variants here and to the rust version.
    ;

/** Error representing an issue parsing an IETF RFC 1278 NSAP address string */
export type RFC1278ParseError =
    /** A malformed IETF RFC 1278 string */
    | "malformed"
    /** An unrecognized--but possibly valid--syntax */
    | "unrecognized_syntax"
    /**
     * Parsing cannot proceed, because the AFI is not recognized, so the number
     * of IDI digits and the syntax of the DSP cannot be determined.
     */
    | "unrecognized_afi"
    /**
     * A DNS name needs to be resolved to an IP address.
     */
    | "resolve_dns"
    /**
     * Shortcomings in the specification make it ambiguous as to how to parse
     * or interpret the string
     */
    | "specification_failure"
    /**
     * Used a prohibited character in the NSAP address string. One such
     * character is the underscore `_`, which is used by RFC 1278 for
     * delimiting NSAP addresses in a presentation address string.
     */
    | "prohibited_character"
    /**
     * The string is too large to parse into an NSAP address. This only happens
     * when heap allocation (`alloc`) is not enabled.
     */
    | "too_large"
    ;
