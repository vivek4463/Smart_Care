import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HUME_API_KEY;
  const secretKey = process.env.HUME_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'Hume API keys not configured' }, { status: 500 });
  }

  try {
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
    const response = await fetch('https://api.hume.ai/v0/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();
    return NextResponse.json({ accessToken: data.access_token });
  } catch (error) {
    console.error('Hume Auth Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Hume access token' }, { status: 500 });
  }
}
