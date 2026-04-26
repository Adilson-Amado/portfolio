import { cmsFunctionUrl, supabase, supabasePublishableKey } from './supabase';

export type CmsAccessStatus = {
  authenticated: boolean;
  isAdmin: boolean;
  email: string | null;
};

type CmsMutationPayload =
  | { action: 'status' }
  | { action: 'upsert-singleton'; table: string; data: Record<string, unknown> }
  | { action: 'upsert-record'; table: string; id: string; data: Record<string, unknown> }
  | { action: 'insert-record'; table: string; data: Record<string, unknown> }
  | { action: 'delete-record'; table: string; id: string };

type CmsMutationResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  id?: string;
  authenticated?: boolean;
  isAdmin?: boolean;
  email?: string | null;
  error?: string;
};

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

async function callCmsFunction<T>(payload: CmsMutationPayload): Promise<CmsMutationResponse<T>> {
  const accessToken = await getAccessToken();

  const response = await fetch(cmsFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabasePublishableKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => ({ error: 'Resposta inválida do CMS backend.' }))) as CmsMutationResponse<T>;

  if (!response.ok || !result.ok) {
    throw new Error(result.error || `CMS backend error (${response.status})`);
  }

  return result;
}

export async function getCmsAccessStatus(): Promise<CmsAccessStatus> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      authenticated: false,
      isAdmin: false,
      email: null,
    };
  }

  const result = await callCmsFunction<{ authenticated: boolean; isAdmin: boolean; email: string | null }>({
    action: 'status',
  });

  return {
    authenticated: Boolean(result.authenticated),
    isAdmin: Boolean(result.isAdmin),
    email: result.email ?? null,
  };
}

export async function signInCms(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutCms(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export function onCmsAuthStateChange(callback: () => void) {
  return supabase.auth.onAuthStateChange(() => {
    callback();
  });
}

export async function cmsUpsertSingleton<T>(table: string, data: Record<string, unknown>): Promise<T | null> {
  const result = await callCmsFunction<T>({
    action: 'upsert-singleton',
    table,
    data,
  });

  return result.data ?? null;
}

export async function cmsUpsertRecord<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null> {
  const result = await callCmsFunction<T>({
    action: 'upsert-record',
    table,
    id,
    data,
  });

  return result.data ?? null;
}

export async function cmsInsertRecord<T>(table: string, data: Record<string, unknown>): Promise<{ id: string; data: T | null }> {
  const result = await callCmsFunction<T>({
    action: 'insert-record',
    table,
    data,
  });

  return {
    id: result.id || '',
    data: result.data ?? null,
  };
}

export async function cmsDeleteRecord(table: string, id: string): Promise<void> {
  await callCmsFunction({
    action: 'delete-record',
    table,
    id,
  });
}
