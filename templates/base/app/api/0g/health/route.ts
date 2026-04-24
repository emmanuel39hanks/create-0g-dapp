import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/0g/health';

export async function GET() {
  try {
    const health = await checkHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
