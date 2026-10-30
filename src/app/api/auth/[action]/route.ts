import { NextRequest, NextResponse } from 'next/server';
import {
  authContext,
  publicAccount,
  readAccountInput,
} from '@/lib/account-server';
import {
  credentialsSchema,
  profileSchema,
  registrationSchema,
} from '@/lib/account-schema';

type Context = { params: Promise<{ action: string }> };
const errorReply = (error: string, status: number, code = 'AUTH_ERROR') =>
  NextResponse.json(
    { error, code },
    { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  );

export async function GET(request: NextRequest, { params }: Context) {
  if ((await params).action !== 'session')
    return errorReply('없는 요청입니다.', 404);
  try {
    const { client, reply } = authContext(request);
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return reply({ user: null });
    return reply({ user: publicAccount(data.user) });
  } catch {
    return errorReply(
      '로그인 서비스를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      503,
    );
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const action = (await params).action;
  if (!['register', 'login', 'logout'].includes(action))
    return errorReply('없는 요청입니다.', 404);
  try {
    const input = await readAccountInput(request);
    const { client, reply } = authContext(request);
    if (action === 'logout') {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error && error.status !== 403)
        return reply(
          { error: '로그아웃하지 못했습니다. 다시 시도해 주세요.' },
          503,
        );
      return reply({ user: null });
    }
    if (action === 'register') {
      const parsed = registrationSchema.safeParse(input);
      if (!parsed.success)
        return reply(
          {
            error:
              '이름·집주소·이메일을 확인하고 비밀번호를 10~128자로 입력해 주세요.',
          },
          400,
        );
      const { email, password, name, address } = parsed.data;
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { name, address } },
      });
      if (error)
        return reply(
          {
            error:
              error.status === 429
                ? '가입 요청이 많습니다. 잠시 후 다시 시도해 주세요.'
                : '가입하지 못했습니다. 이미 가입한 이메일이면 로그인해 주세요.',
          },
          error.status === 429 ? 429 : 400,
        );
      if (!data.session || !data.user) {
        await client.auth.signOut({ scope: 'local' });
        return reply({ user: null, requiresEmailVerification: true });
      }
      return reply({
        user: publicAccount(data.user),
        requiresEmailVerification: false,
      });
    }
    const parsed = credentialsSchema.safeParse(input);
    if (!parsed.success)
      return reply(
        {
          error: '이메일과 비밀번호를 확인해 주세요.',
          code: 'INVALID_CREDENTIALS',
        },
        400,
      );
    const { data, error } = await client.auth.signInWithPassword(parsed.data);
    if (error || !data.user) {
      await client.auth.signOut({ scope: 'local' });
      return reply(
        {
          error:
            error?.code === 'email_not_confirmed'
              ? '이메일 확인 후 로그인해 주세요.'
              : error?.status === 429
                ? '로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.'
                : '이메일 또는 비밀번호가 맞지 않습니다.',
          code:
            error?.code === 'invalid_credentials'
              ? 'INVALID_CREDENTIALS'
              : 'LOGIN_FAILED',
        },
        error?.status === 429 ? 429 : 401,
      );
    }
    return reply({ user: publicAccount(data.user) });
  } catch (error) {
    if (error instanceof Error && error.message === 'ORIGIN')
      return errorReply('이 사이트에서 다시 요청해 주세요.', 403);
    if (error instanceof Error && error.message === 'INPUT')
      return errorReply('입력한 정보를 확인해 주세요.', 400);
    return errorReply(
      '로그인 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      503,
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  if ((await params).action !== 'profile')
    return errorReply('없는 요청입니다.', 404);
  try {
    const input = await readAccountInput(request);
    const { client, reply } = authContext(request);
    const { data: identity, error: identityError } =
      await client.auth.getUser();
    if (identityError || !identity.user)
      return reply({ error: '로그인 후 내 정보를 수정해 주세요.' }, 401);
    const parsed = profileSchema.strict().safeParse(input);
    if (!parsed.success)
      return reply(
        { error: '이름은 1~40자, 집주소는 5~200자로 입력해 주세요.' },
        400,
      );
    const { data, error } = await client.auth.updateUser({ data: parsed.data });
    if (error || !data.user)
      return reply(
        { error: '내 정보를 저장하지 못했습니다. 다시 시도해 주세요.' },
        400,
      );
    return reply({ user: publicAccount(data.user) });
  } catch (error) {
    if (error instanceof Error && error.message === 'ORIGIN')
      return errorReply('이 사이트에서 다시 요청해 주세요.', 403);
    if (error instanceof Error && error.message === 'INPUT')
      return errorReply('입력한 정보를 확인해 주세요.', 400);
    return errorReply(
      '내 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      503,
    );
  }
}
