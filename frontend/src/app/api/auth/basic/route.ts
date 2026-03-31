import { NextRequest, NextResponse } from 'next/server';

type AuthApiResponse = Record<string, unknown>;

function extractToken(payload: AuthApiResponse): string | null {
  const candidates = [
    payload.firebaseCustomToken,
    payload.firebase_custom_token,
    payload.customToken,
    payload.custom_token,
    payload.token,
    payload.idToken,
    payload.id_token,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function extractUserId(payload: AuthApiResponse): string | null {
  const candidates = [
    payload.uid,
    payload.user_id,
    payload.userId,
    payload.id,
    payload.email,
    payload.username,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

async function callAuthApi(url: string, email: string, password: string) {
  // Tentativa 1: JSON POST
  try {
    const jsonResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        username: email,
      }),
      cache: 'no-store',
    });

    if (jsonResponse.ok) {
      return jsonResponse;
    }
  } catch (err) {
    console.log('[Auth] JSON attempt failed:', err);
  }

  // Tentativa 2: HTTP Basic Auth
  try {
    const basicAuth = Buffer.from(`${email}:${password}`).toString('base64');
    const basicResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (basicResponse.ok) {
      return basicResponse;
    }
  } catch (err) {
    console.log('[Auth] Basic auth attempt failed:', err);
  }

  // Se nenhuma tentativa funcionou, retorna erro
  throw new Error('Falha ao conectar com o servidor de autenticação.');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };

    console.log('[Auth] Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const authApiUrl = process.env.PYTHON_AUTH_API || process.env.NEXT_PUBLIC_PYTHON_AUTH_API;

    if (!authApiUrl) {
      console.error('[Auth] PYTHON_AUTH_API não configurado');
      return NextResponse.json(
        { error: 'Configuração de autenticação indisponível.' },
        { status: 500 }
      );
    }

    console.log('[Auth] Calling API:', authApiUrl);

    const response = await callAuthApi(authApiUrl, email, password);
    const responseText = await response.text();

    console.log('[Auth] API response status:', response.status);

    let payload: AuthApiResponse = {};
    try {
      payload = responseText ? (JSON.parse(responseText) as AuthApiResponse) : {};
    } catch (parseErr) {
      console.error('[Auth] JSON parse error:', parseErr);
      payload = { message: responseText };
    }

    if (!response.ok) {
      const message =
        (typeof payload.error === 'string' && payload.error) ||
        (typeof payload.message === 'string' && payload.message) ||
        'Credenciais inválidas.';

      console.error('[Auth] Authentication failed:', message);
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const token = extractToken(payload);
    const userId = extractUserId(payload) || email;

    console.log('[Auth] Authentication successful for:', userId);

    if (!token) {
      console.warn('[Auth] No token in response, will use email as UID');
      return NextResponse.json({
        firebaseCustomToken: null,
        uid: userId,
        profile: payload.profile ?? payload.user ?? { email, uid: userId },
      });
    }

    console.log('[Auth] Token extracted from response');

    return NextResponse.json({
      firebaseCustomToken: token,
      uid: userId,
      profile: payload.profile ?? payload.user ?? { email, uid: userId },
    });
  } catch (error) {
    console.error('[Auth] Error:', error);
    const message = error instanceof Error ? error.message : 'Falha ao autenticar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
