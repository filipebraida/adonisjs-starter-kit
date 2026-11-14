/**
 * A `<domain>.<action>` slug. Core knows no capability: each module declares
 * its own in `#<mod>/enums/capability`, so a typo is a compile error at the
 * constant, not a silent `false` at check time.
 */
export type Capability = `${string}.${string}`
