// Jev に個別に判定させるリスクカテゴリ。1カテゴリ = 1つの Noul 質問。
// 表示名は拡張機能の _locales/*/messages.json の category_<id> にある。
export const CATEGORIES = [
  {
    id: "data_sharing",
    instructions:
      "Does this clause allow the service provider to share users' personal data with third parties or use it for purposes beyond providing the service?",
    criteria: {
      true: "The clause permits third-party sharing, sale, or secondary use of personal data.",
      false: "The clause does not permit such sharing or use, or is unrelated to personal data.",
    },
  },
  {
    id: "unilateral_change",
    instructions:
      "Does this clause allow the service provider to change the terms unilaterally without giving users prior notice?",
    criteria: {
      true: "The provider may change the terms at any time without advance notice or user consent.",
      false: "Changes require advance notice or consent, or the clause is unrelated to changing the terms.",
    },
  },
  {
    id: "liability_limitation",
    instructions:
      "Does this clause broadly exempt the service provider from liability or limit its liability toward users?",
    criteria: {
      true: "The provider disclaims or caps its liability in broad terms.",
      false: "The clause does not limit the provider's liability, or limits it only narrowly.",
    },
  },
  {
    id: "account_termination",
    instructions:
      "Does this clause allow the service provider to suspend or delete user accounts without clear reasons or prior notice?",
    criteria: {
      true: "Accounts can be suspended or deleted at the provider's discretion without clear grounds or notice.",
      false: "Suspension requires clear grounds or notice, or the clause is unrelated to accounts.",
    },
  },
  {
    id: "dispute_resolution",
    instructions:
      "Does this clause impose mandatory arbitration, waive class actions, or designate a court or jurisdiction that is disadvantageous to users?",
    criteria: {
      true: "Users must arbitrate, give up class actions, or litigate in a venue chosen for the provider.",
      false: "The clause imposes none of these, or is unrelated to dispute resolution.",
    },
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
