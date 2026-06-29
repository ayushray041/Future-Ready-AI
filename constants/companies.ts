// constants/companies.ts
// Responsibility: Top target companies used in roadmap goals and opportunity matching.

export const TOP_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Netflix',
  'Flipkart',
  'Uber',
  'Atlassian',
  'Salesforce',
] as const;

export type Company = (typeof TOP_COMPANIES)[number];
