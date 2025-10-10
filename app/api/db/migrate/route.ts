import { NextResponse } from 'next/server';
import { migrate } from '@/lib/db/migrate';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await migrate();
    return NextResponse.json({ status: 'ok', message: 'Migrations completed successfully' });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Migration failed', error: String(error) },
      { status: 500 }
    );
  }
}