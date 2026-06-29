// Career API Route
// Responsibility: Entry-point for Career HTTP requests.
// Business logic is delegated to the corresponding service layer.
// Add request validation, auth guards, and response shaping here.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Career endpoint active' });
}
