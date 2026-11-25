import type { AppState } from './types';

const KEY_STORAGE = 'oasis.device-key.v1';
const DATA_STORAGE = 'oasis.data.v1';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Copie vers un ArrayBuffer : compatible avec les types DOM stricts de WebCrypto. */
function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

async function getDeviceKey(): Promise<CryptoKey | null> {
  if (!globalThis.crypto?.subtle) return null;
  try {
    const stored = localStorage.getItem(KEY_STORAGE);
    if (stored) {
      const jwk = JSON.parse(stored) as JsonWebKey;
      return await crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    }
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    localStorage.setItem(KEY_STORAGE, JSON.stringify(await crypto.subtle.exportKey('jwk', key)));
    return key;
  } catch {
    return null;
  }
}

/**
 * Chiffrement AES-GCM au repos des regles, de l historique et des contacts.
 * Limite connue du navigateur : la cle de l appareil vit dans le stockage
 * local. Les builds natifs doivent la placer dans Keychain / Android Keystore
 * (voir docs/ARCHITECTURE.md). Aucune donnee n est envoyee a un serveur.
 */
export async function saveState(state: AppState): Promise<void> {
  try {
    const key = await getDeviceKey();
    const raw = encoder.encode(JSON.stringify(state));
    if (key) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: arrayBuffer(iv) }, key, arrayBuffer(raw));
      localStorage.setItem(DATA_STORAGE, JSON.stringify({ v: 1, iv: toBase64(iv), cipher: toBase64(new Uint8Array(cipher)) }));
    } else {
      localStorage.setItem(DATA_STORAGE, JSON.stringify({ v: 0, plain: state }));
    }
  } catch {
    // Echec de stockage : l application reste utilisable en memoire.
  }
}

export async function loadState(): Promise<AppState | null> {
  try {
    const stored = localStorage.getItem(DATA_STORAGE);
    if (!stored) return null;
    const payload = JSON.parse(stored) as { v: number; iv?: string; cipher?: string; plain?: AppState };
    if (payload.v === 0 && payload.plain) return payload.plain;
    if (!payload.iv || !payload.cipher) return null;
    const key = await getDeviceKey();
    if (!key) return null;
    const clear = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: arrayBuffer(fromBase64(payload.iv)) },
      key,
      arrayBuffer(fromBase64(payload.cipher)),
    );
    return JSON.parse(decoder.decode(clear)) as AppState;
  } catch {
    return null;
  }
}

export async function clearStoredData(): Promise<void> {
  localStorage.removeItem(DATA_STORAGE);
  localStorage.removeItem(KEY_STORAGE);
}

export function newSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

/** PIN : PBKDF2-SHA256, 120 000 iterations. Le PIN en clair n est jamais stocke. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const base = await crypto.subtle.importKey('raw', arrayBuffer(encoder.encode(pin)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: arrayBuffer(fromBase64(salt)), iterations: 120_000 },
    base,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

export async function verifyPin(pin: string, salt: string, expected: string): Promise<boolean> {
  const actual = await hashPin(pin, salt);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export function isBiometricAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && window.isSecureContext;
}

function randomChallenge(): ArrayBuffer {
  return arrayBuffer(crypto.getRandomValues(new Uint8Array(32)));
}

function toBase64Url(bytes: ArrayBuffer): string {
  return toBase64(new Uint8Array(bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  return fromBase64(value.replace(/-/g, '+').replace(/_/g, '/'));
}

/** WebAuthn / passkey locale : aucune donnee biometrique n est stockee par l app. */
export async function registerBiometric(): Promise<string | null> {
  if (!isBiometricAvailable() || !navigator.credentials?.create) return null;
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: { name: 'OasisNet' },
        user: {
          id: arrayBuffer(encoder.encode('parent-local')),
          name: 'parent@oasisnet.local',
          displayName: 'Espace parent',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60_000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;
    return credential ? toBase64Url(credential.rawId) : null;
  } catch {
    return null;
  }
}

export async function authenticateBiometric(credentialId: string): Promise<boolean> {
  if (!isBiometricAvailable() || !credentialId || !navigator.credentials?.get) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        allowCredentials: [{ type: 'public-key', id: arrayBuffer(fromBase64Url(credentialId)) }],
        userVerification: 'required',
        timeout: 60_000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}
