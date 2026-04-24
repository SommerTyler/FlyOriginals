import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://ikecjftuznkjvrtefeiv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Jspdoxs6GEv0_kMEeT-WFQ_TFsJVR7W'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
