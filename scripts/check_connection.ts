
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('📡 Checking Supabase API connection...');
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        console.log(`✅ Connection successful! Found ${data.users.length} users.`);
    } catch (err) {
        console.error('❌ API Connection failed:', err);
    }
}

check();
