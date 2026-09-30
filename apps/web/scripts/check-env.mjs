const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const errors = []
if (!url || url.includes('YOUR_PROJECT_REF')) errors.push('NEXT_PUBLIC_SUPABASE_URL is missing or still uses the example value.')
if (!key || key.includes('REPLACE_ME')) errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing or still uses the example value.')
if (url && !/^https:\/\/[A-Za-z0-9.-]+\.supabase\.co$/.test(url)) errors.push('NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase project URL.')
if (errors.length) { console.error('\nMirror Gram environment check failed:\n- ' + errors.join('\n- ')); process.exit(1) }
console.log('Mirror Gram environment check passed.')
