// constants/years.ts
// Responsibility: Academic year options for student profiles.

export const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];
