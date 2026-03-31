import { db } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Message = {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  channelId?: string;
  dmId?: string;
  createdAt: { toDate: () => Date } | null;
};

export type Channel = {
  id: string;
  name: string;
  description?: string;
  type?: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  department?: string;
  role?: string;
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

/** Salva/atualiza o perfil do usuário no Firestore ao logar */
export async function syncUserToFirestore(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Servidor',
      department: 'Geral',
      role: 'Servidor',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });
  }
}

/** Busca todos os usuários (diretório de servidores) */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    snapshot.forEach(d => users.push(d.data() as UserProfile));
    return users;
  } catch {
    return [];
  }
}

// ─── CHANNELS ─────────────────────────────────────────────────────────────────

export async function getChannels(): Promise<Channel[]> {
  try {
    const snapshot = await getDocs(collection(db, 'channels'));
    const channels: Channel[] = [];
    snapshot.forEach(d => channels.push({ id: d.id, ...d.data() } as Channel));
    return channels;
  } catch {
    return [];
  }
}

export function subscribeToMessages(channelId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, `channels/${channelId}/messages`),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const msgs: Message[] = [];
    snapshot.forEach(d => msgs.push({ id: d.id, ...d.data() } as Message));
    callback(msgs);
  });
}

export async function sendMessage(channelId: string, text: string, senderName: string, senderId: string) {
  await addDoc(collection(db, `channels/${channelId}/messages`), {
    text,
    senderName,
    senderId,
    channelId,
    createdAt: serverTimestamp(),
  });
}

// ─── DIRECT MESSAGES ──────────────────────────────────────────────────────────

/** DM ID = ID menor + ID maior, alfabeticamente — garante unicidade */
export function getDmId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

/** Cria ou busca a sala de DM entre dois usuários */
export async function getOrCreateDm(uid1: string, uid2: string): Promise<string> {
  const dmId = getDmId(uid1, uid2);
  const dmRef = doc(db, 'direct_messages', dmId);
  const existing = await getDoc(dmRef);

  if (!existing.exists()) {
    await setDoc(dmRef, {
      members: [uid1, uid2],
      createdAt: serverTimestamp(),
    });
  }

  return dmId;
}

export function subscribeToDmMessages(dmId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, `direct_messages/${dmId}/messages`),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const msgs: Message[] = [];
    snapshot.forEach(d => msgs.push({ id: d.id, ...d.data() } as Message));
    callback(msgs);
  });
}

export async function sendDmMessage(dmId: string, text: string, senderName: string, senderId: string) {
  await addDoc(collection(db, `direct_messages/${dmId}/messages`), {
    text,
    senderName,
    senderId,
    dmId,
    createdAt: serverTimestamp(),
  });
}
