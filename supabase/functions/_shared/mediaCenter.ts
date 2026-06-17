// Utilitaires partagés des Edge Functions du Centre Média FEGESPORT
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.50.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Key',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

/**
 * Vérifie que l'appelant est un administrateur actif (table admin_users).
 * Retourne l'utilisateur, ou null si non autorisé.
 */
export async function requireAdmin(
  req: Request,
  supabase: SupabaseClient,
): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!admin) return null;
  return { id: user.id, email: user.email ?? '' };
}

/** Accès machine-à-machine (cron / webhooks internes) via secret partagé. */
export function isCronCall(req: Request): boolean {
  const cronKey = Deno.env.get('MEDIA_CRON_KEY');
  return !!cronKey && req.headers.get('X-Cron-Key') === cronKey;
}

export interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
}

export const CLAUDE_MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-6';

/**
 * Appelle l'API Claude (Anthropic Messages API) et retourne le texte + l'usage.
 */
export async function callClaude(
  system: string,
  userPrompt: string,
  maxTokens = 8000,
): Promise<{ text: string; usage: ClaudeUsage }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY non configurée (supabase secrets set)');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Claude API ${response.status}: ${errBody.slice(0, 500)}`);
  }

  const data = await response.json();
  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('');

  return {
    text,
    usage: {
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    },
  };
}

/** Extrait un objet JSON d'une réponse de modèle (tolère les blocs ```json). */
export function parseModelJson<T>(text: string): T {
  const cleaned = text
    .replace(/^[\s\S]*?```(?:json)?\s*/m, (m) => (text.includes('```') ? '' : m))
    .replace(/```[\s\S]*$/m, '')
    .trim();
  const candidate = cleaned.startsWith('{') || cleaned.startsWith('[')
    ? cleaned
    : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(candidate) as T;
}

export async function logAiUsage(
  supabase: SupabaseClient,
  entry: {
    function_name: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    event_id?: string | null;
    success?: boolean;
    error_message?: string | null;
  },
): Promise<void> {
  await supabase.from('ai_usage_logs').insert({ success: true, ...entry });
}

export async function logPublication(
  supabase: SupabaseClient,
  entry: {
    entity_type: string;
    entity_id: string;
    action: string;
    channel?: string | null;
    performed_by?: string | null;
    performed_by_email?: string | null;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  await supabase.from('publication_logs').insert(entry);
}

/** Vérifie le quota IA journalier (fonction SQL check_media_ai_quota). */
export async function checkAiQuota(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_media_ai_quota');
  if (error) {
    console.error('check_media_ai_quota error:', error.message);
    return true; // ne bloque pas la production si la fonction est indisponible
  }
  return data === true;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}
