import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const phone = searchParams.get('phone');
    const type = searchParams.get('type') || 'all';

    // Handle phone-only search (used by CSC dashboard)
    if (phone) {
        try {
            const { data, error } = await supabaseServer
                .from('citizen_profiles')
                .select('*')
                .eq('mobile_number', phone)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
                }
                throw error;
            }
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    if (!query) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    try {
        let supabaseQuery = supabaseServer.from('citizen_profiles').select('*');

        if (type === 'aadhaar') {
            supabaseQuery = supabaseQuery.or(`aadhaar_number.eq.${query},citizen_id.eq.${query}`);
        } else if (type === 'phone') {
            supabaseQuery = supabaseQuery.eq('mobile_number', query);
        } else if (type === 'name') {
            supabaseQuery = supabaseQuery.ilike('full_name', `%${query}%`);
        } else {
            supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%,mobile_number.eq.${query},citizen_id.eq.${query},aadhaar_number.eq.${query}`);
        }

        const { data, error } = await supabaseQuery;

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
