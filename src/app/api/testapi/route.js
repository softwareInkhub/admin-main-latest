import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({ 
    message: "Test API is working!", 
    timestamp: new Date().toISOString() 
  });
}

export async function POST(request) {
  const body = await request.json();
  return NextResponse.json({ 
    message: "POST request received", 
    data: body,
    timestamp: new Date().toISOString() 
  });
}   