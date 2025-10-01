import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.ENABLE_TWITTER !== '1') {
    return NextResponse.json({
      status: 'success',
      comingSoon: true,
      data: [],
    });
  }

  return NextResponse.json({
    status: 'success',
    data: [],
  });
}
