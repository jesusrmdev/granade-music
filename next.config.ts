import type { NextConfig } from "next";

const SUPABASE_URL = 'https://fopeiowtwobxbwgugnml.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_arwVdKMguwqHXNb5cx9Uuw_vv-sAgHU'

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
