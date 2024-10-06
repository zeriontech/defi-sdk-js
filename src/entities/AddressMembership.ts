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
    plan: "Bundle" | "Single";
    features: {
      fee_waiver: boolean;
      csv: boolean;
      pnl: boolean;
      perks: boolean;
      early_access: boolean;
    };
  };
}

export type ParentToken = MigrationToken & { owner: string };

export interface XpDistribution {
  earned: number;
  locked: number;
  referred: number;
}

export interface ReferrerNFT {
  chain: string;
  contract_address: string;
  token_id: string;
  metadata: {
    name: string | null;
    content: {
      type: string;
      audio_url: string | null;
      image_preview_url: string | null;
      image_url: string | null;
      video_url: string | null;
    } | null;
  };
}

export interface Referrer {
  referral_code: string;
  address: string | null;
  handle: string | null;
  nft: ReferrerNFT | null;
}

export interface AddressMembership {
  parent_tokens: ParentToken[] | null;
  premium: MigrationToken["premium"] | null;
  tokens: MigrationToken[] | null;
  migration: {
    migration_end_time: string;
    trial_end_time: string;
    non_premium_tokens: NonPremiumTokens[];
    balances: MigrationBalances[];
  } | null;
  xp: XpDistribution;
  level: number;
  level_progress: number;
  referral_code: string | null;
  referral_link: string | null;
  referred: number;
  referrer: Referrer;
}
