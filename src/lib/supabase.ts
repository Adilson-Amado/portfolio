import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://k73gwbxkqvgthgmdjndg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ims3M2d3YnhrcXZndGhnbWRqbmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTE2NjMsImV4cCI6MjA2MTcyNzY2M30.k73gWb+kqv9jD7WDhY8mYvK6rZ1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9';

export const supabase = createClient(supabaseUrl, supabaseKey);