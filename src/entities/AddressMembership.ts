interface NonPremiumTokens {
  generation: "G1" | "OnePointO";
  id: string;
}

interface MigrationBalances {
  id: string;
  initial: number;
  remained: number;
}

export interface MigrationToken {
  generation: "G1" | "OnePointO";
  id: string;
  premium: {
    expiration_time: string | null;
    bundle: { address: string; update_allowed_at: string }[] | null;
    type: "Bundle" | "Single";
  };
}

export interface AddressMembership {
  parentTokens: MigrationToken[];
  premium: MigrationToken["premium"] | null;
  tokens: MigrationToken[] | null;
  migration: {
    migration_end_time: string;
    trial_end_time: string;
    non_premium_tokens: NonPremiumTokens[];
    balances: MigrationBalances[];
  } | null;
}
