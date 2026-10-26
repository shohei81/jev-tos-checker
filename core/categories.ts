// Jev に個別に判定させるリスクカテゴリ。1カテゴリ = 1つの Score 質問。
// 表示名は拡張機能の _locales/*/messages.json の category_<id> にある。
// 目的は悪質な条項だけを示すことなので、大手サービスで一般的な扱い (common) を問題なしの側に明記し、
// 一般的な範囲を大きく超える扱い (abusive) だけを最上位にする。
export const CATEGORIES = [
  {
    id: "data_sharing",
    topic: "how users' personal data is collected, shared, or used",
    common:
      "sharing data with vendors that process it on the provider's behalf, disclosing it when required by law, using it to run and improve the service, or showing personalized ads that users can control",
    abusive:
      "selling personal data, or giving it to third parties for their own purposes without the user's consent",
  },
  {
    id: "unilateral_change",
    topic: "changes to the terms",
    common:
      "updating the terms with advance notice of material changes, where continuing to use the service after the notice means accepting them",
    abusive: "changing the terms at any time with no notice at all, or applying changes retroactively",
  },
  {
    id: "liability_limitation",
    topic: "the provider's liability to users",
    common:
      "disclaiming warranties, capping liability at the fees paid or a fixed amount, or excluding indirect damages, while keeping any liability the law requires",
    abusive:
      "excluding all liability even for the provider's own intentional misconduct or gross negligence, or making users give up rights that the law guarantees",
  },
  {
    id: "account_termination",
    topic: "suspending or deleting user accounts and data",
    common: "suspending accounts for violations of the terms or for legal reasons, usually with notice",
    abusive:
      "deleting accounts and user data, or keeping users' paid balances, at any time for no reason and without notice",
  },
  {
    id: "dispute_resolution",
    topic: "how disputes between users and the provider are resolved",
    common:
      "choosing the law and courts of the provider's home location, while allowing local consumer laws and courts to apply where required",
    abusive:
      "forcing users into binding arbitration or a class action waiver, or forbidding them from going to court in their own country even where the law allows it",
  },
  {
    id: "auto_renewal",
    topic: "subscriptions, automatic renewal, and cancellation",
    common: "subscriptions that renew automatically after clear disclosure and can be cancelled online at any time",
    abusive:
      "making cancellation difficult (for example only by mail or phone), charging cancellation penalties, or renewing without telling users",
  },
  {
    id: "content_rights",
    topic: "rights the provider receives over content that users create or upload",
    common:
      "a license limited to operating, promoting, and improving the service, with users keeping ownership of their content",
    abusive:
      "taking ownership of user content, or a perpetual, irrevocable license to sell or commercially exploit it beyond running the service",
  },
  {
    id: "fees_and_charges",
    topic: "prices, fees, and charges",
    common: "price changes announced in advance, with the option to cancel before they take effect",
    abusive:
      "charging users or raising prices without consent or notice, hidden fees, or keeping payments for services that were not provided",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
