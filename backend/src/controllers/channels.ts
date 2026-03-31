import { Request, Response } from 'express';
import { getFirestore } from '../services/firebase';

export async function createOfficialChannel(req: Request, res: Response): Promise<void> {
  const db = getFirestore();
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'O nome do canal é obrigatório' });
      return;
    }

    const docRef = await db.collection('channels').add({
      name,
      description: description || '',
      isOfficial: true,
      createdAt: new Date(),
    });

    res.status(201).json({ id: docRef.id, message: 'Canal oficial criado com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar canal:', error);
    res.status(500).json({ error: 'Erro interno ao criar canal.' });
  }
}

export async function listChannels(req: Request, res: Response): Promise<void> {
  const db = getFirestore();
  try {
    const snapshot = await db.collection('channels').get();
    const channels: { id: string; name: string; description?: string; isOfficial?: boolean }[] = [];
    
    snapshot.forEach((doc) => {
      channels.push({ id: doc.id, ...(doc.data() as { name: string; description?: string; isOfficial?: boolean }) });
    });

    res.status(200).json(channels);
  } catch (error) {
    console.error('Erro ao buscar canais:', error);
    res.status(500).json({ error: 'Erro interno ao listar canais.' });
  }
}
