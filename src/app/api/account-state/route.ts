import { NextRequest, NextResponse } from 'next/server';
import { authContext, readAccountInput } from '@/lib/account-server';
import {
  parseAccountState,
  stateWriteSchema,
} from '@/lib/account-state-schema';

const failure = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  );
const columns = 'kind,data,version,updated_at';

export async function GET(request: NextRequest) {
  try {
    const { client, reply } = authContext(request);
    const { data: identity, error } = await client.auth.getUser();
    if (error || !identity.user)
      return reply({ error: '로그인 후 기록을 확인해 주세요.' }, 401);
    const result = await client
      .from('user_app_state')
      .select(columns)
      .eq('user_id', identity.user.id);
    if (result.error)
      return reply({ error: '저장된 기록을 불러오지 못했습니다.' }, 503);
    return reply({ accountId: identity.user.id, records: result.data });
  } catch {
    return failure(
      '저장 서비스를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      503,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const input = await readAccountInput(request, 120_000);
    const { client, reply } = authContext(request);
    const { data: identity, error } = await client.auth.getUser();
    if (error || !identity.user)
      return reply({ error: '로그인 후 기록을 저장해 주세요.' }, 401);
    const parsed = stateWriteSchema.safeParse(input);
    if (!parsed.success)
      return reply({ error: '저장할 기록의 형식을 확인해 주세요.' }, 400);
    const { accountId, kind, expectedVersion } = parsed.data;
    // 요청의 accountId는 계정 전환 중 전송을 차단하는 용도다. 소유자는 검증된 세션에서 결정한다.
    if (accountId !== identity.user.id)
      return reply(
        { error: '로그인 계정이 변경됐습니다. 새로고침해 주세요.' },
        403,
      );
    const data = parseAccountState(kind, parsed.data.data);
    const values = {
      data,
      version: expectedVersion + 1,
      updated_at: new Date().toISOString(),
    };
    const result =
      expectedVersion === 0
        ? await client
            .from('user_app_state')
            .insert({ ...values, user_id: identity.user.id, kind })
            .select(columns)
            .single()
        : await client
            .from('user_app_state')
            .update(values)
            .eq('user_id', identity.user.id)
            .eq('kind', kind)
            .eq('version', expectedVersion)
            .select(columns)
            .maybeSingle();
    if (result.error && result.error.code !== '23505')
      return reply(
        { error: '기록을 저장하지 못했습니다. 다시 시도해 주세요.' },
        503,
      );
    if (result.error?.code === '23505' || !result.data) {
      const current = await client
        .from('user_app_state')
        .select(columns)
        .eq('user_id', identity.user.id)
        .eq('kind', kind)
        .maybeSingle();
      if (current.error)
        return reply({ error: '최신 기록을 확인하지 못했습니다.' }, 503);
      return reply(
        {
          accountId: identity.user.id,
          record: current.data,
          error:
            '다른 기기에서 기록이 변경됐습니다. 최신 기록을 불러와 주세요.',
          code: 'STATE_CONFLICT',
        },
        409,
      );
    }
    return reply({ accountId: identity.user.id, record: result.data });
  } catch (error) {
    if (error instanceof Error && error.message === 'ORIGIN')
      return failure('이 사이트에서 다시 요청해 주세요.', 403);
    if (
      error instanceof Error &&
      ['INPUT', 'STATE_INPUT'].includes(error.message)
    )
      return failure('저장할 기록의 형식이나 크기를 확인해 주세요.', 400);
    return failure(
      '저장 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      503,
    );
  }
}
