import { createClient } from "@supabase/supabase-js"

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if(!supabaseURL || !anonKey) {
    throw new Error("Missing Supabase configuration in .env.local")
}

export const supabase = createClient(supabaseURL, anonKey);