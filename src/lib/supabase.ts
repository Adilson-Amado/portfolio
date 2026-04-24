import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xahrwrfttaazplqarcha.supabase.co';
const supabaseKey = 'sbp_63337fef46b325081c5c45179480b557d89f0475';

export const supabase = createClient(supabaseUrl, supabaseKey);