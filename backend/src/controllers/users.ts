import { Request, Response } from 'express';
import { getAuth } from '../services/firebase';

/**
 * Create the very first administrator user in Firebase Authentication.
 * SECURITY NOTE: This route should be protected or removed after first use.
 * In production, add an ADMIN_CREATION_SECRET ENV check before allowing user creation.
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  const auth = getAuth();
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: true,
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso.',
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error: unknown) {
    const fbError = error as { code?: string; message?: string };
    if (fbError.code === 'auth/email-already-exists') {
      res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    } else {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro interno ao criar usuário.', detail: fbError.message });
    }
  }
}
