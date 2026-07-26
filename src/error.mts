// TODO: Some of these variants are no longer used. Find out why.
// TODO: Move variant docs to the type definition.

/** Error representing an issue parsing an IETF RFC 1278 NSAP address string */
export type NSAPAddressParseError =
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
