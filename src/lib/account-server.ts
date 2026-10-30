import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';
import { demoUserSchema } from './account-schema';

export function publicAccount(user: User) {
  return demoUserSchema.parse({
    id: user.id,
    email: user.email,
    name:
      typeof user.user_metadata.name === 'string'
        ? user.user_metadata.name
        : user.email?.split('@')[0],
    address:
      typeof user.user_metadata.address === 'string'
        ? user.user_metadata.address
        : '',
  });
}

export function authContext(request: NextRequest) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('AUTH_NOT_CONFIGURED');
  const changed: { name: string; value: string; options: CookieOptions }[] = [];
  const client = createServerClient(url, key, {
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        for (const item of items) {
          request.cookies.set(item.name, item.value);
          changed.push(item);
        }
      },
    },
  });
  function reply(body: unknown, status = 200) {
    const response = NextResponse.json(body, {
      status,
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        Vary: 'Cookie',
        Pragma: 'no-cache',
      },
    });
    for (const { name, value, options } of changed)
      response.cookies.set(name, value, options);
    return response;
  }
  return { client, reply };
}

export async function readAccountInput(request: NextRequest) {
  const rawOrigin = request.headers.get('origin');
  const host = request.headers.get('host') ?? new URL(request.url).host;
  let origin: URL;
  try {
    origin = new URL(rawOrigin ?? '');
  } catch {
    throw new Error('ORIGIN');
  }
  if (origin.host !== host || !['http:', 'https:'].includes(origin.protocol))
    throw new Error('ORIGIN');
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('INPUT');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('INPUT');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 8192) {
      await reader.cancel();
      throw new Error('INPUT');
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(buffer)) as unknown;
  } catch {
    throw new Error('INPUT');
  }
}
