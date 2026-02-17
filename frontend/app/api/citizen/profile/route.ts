import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const profileData = await request.json();

        // Basic validation
        if (!profileData.full_name || !profileData.age || !profileData.state) {
            return NextResponse.json(
                { error: 'Missing required fields: full_name, age, state' },
                { status: 400 }
            );
        }

        const citizenId = profileData.citizen_id || `CIT_${Date.now()}`;

        const { data, error } = await supabaseServer
            .from('citizen_profiles')
            .upsert({
                citizen_id: citizenId,
                full_name: profileData.full_name,
                aadhaar_hash: profileData.aadhaar_number ? 'HASH_' + profileData.aadhaar_number.slice(-4) : null,
                encrypted_data: null,
                profile_data: profileData
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ message: 'Profile created successfully', profile: data }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
