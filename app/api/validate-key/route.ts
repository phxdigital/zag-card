import { NextResponse } from 'next/server';

export async function GET() {
  const envKey = process.env.ASAAS_API_KEY;
  const hardcodedKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmQzNTEzODQ1LTI4ZTEtNDNjNi05NjhiLWRhODVhZDRiZTRjNzo6JGFhY2hfYWExMGQ5MzMtNjkzYy00YmJjLWI2NjItM2JkMGZlMWEyYzQy';
  
  return NextResponse.json({
    envKey: {
      exists: !!envKey,
      length: envKey ? envKey.length : 0,
      firstChars: envKey ? envKey.substring(0, 20) : 'N/A',
      lastChars: envKey ? envKey.substring(envKey.length - 20) : 'N/A',
      matches: envKey === hardcodedKey
    },
    hardcodedKey: {
      length: hardcodedKey.length,
      firstChars: hardcodedKey.substring(0, 20),
      lastChars: hardcodedKey.substring(hardcodedKey.length - 20)
    },
    recommendation: envKey === hardcodedKey 
      ? '✅ Chave do .env.local está correta!' 
      : '❌ Chave do .env.local está diferente da hardcoded'
  });
}
