// types/opportunity.ts
// Responsibility: Types for opportunities (internships, hackathons, fellowships).

export type OpportunityType = 'INTERNSHIP' | 'HACKATHON' | 'FELLOWSHIP' | 'COMPETITION' | 'OPEN SOURCE';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  company: string;
  matchScore: number;
  deadline: string;
  applyUrl: string;
  description?: string;
  tags: string[];
}
