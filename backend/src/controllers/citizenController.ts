
import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const createCitizenProfile = async (req: Request, res: Response) => {
    try {
        const profileData = req.body;

        // Basic validation
        if (!profileData.full_name || !profileData.age || !profileData.state) {
            return res.status(400).json({ error: 'Missing required fields: full_name, age, state' });
        }

        // Generate a simple ID if not provided (normally Supabase handles UUIDs, but we use string IDs in schema)
        // For now, let's assume the frontend sends a unique ID or we generate one.
        // In our schema, citizen_id is a string.
        const citizenId = profileData.citizen_id || `CIT_${Date.now()}`;

        const { data, error } = await supabase
            .from('citizen_profiles')
            .upsert({
                citizen_id: citizenId,
                full_name: profileData.full_name,
                aadhaar_hash: profileData.aadhaar_number ? 'HASH_' + profileData.aadhaar_number.slice(-4) : null, // Mock hash
                encrypted_data: null, // Placeholder if we were doing real encryption
                profile_data: profileData // Store the full JSON
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Profile created successfully', profile: data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const searchCitizens = async (req: Request, res: Response) => {
    const { query, type } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        let supabaseQuery = supabase.from('citizen_profiles').select('*');

        if (type === 'aadhaar') {
            // In our test data, we match exactly or by ID
            supabaseQuery = supabaseQuery.or(`aadhaar_number.eq.${query},citizen_id.eq.${query}`);
        } else if (type === 'phone') {
            supabaseQuery = supabaseQuery.eq('mobile_number', query);
        } else if (type === 'name') {
            supabaseQuery = supabaseQuery.ilike('full_name', `%${query}%`);
        } else {
            // Default: search all
            supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%,mobile_number.eq.${query},citizen_id.eq.${query},aadhaar_number.eq.${query}`);
        }

        const { data, error } = await supabaseQuery;

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCitizenByPhone = async (req: Request, res: Response) => {
    const { phone } = req.query;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const { data, error } = await supabase
            .from('citizen_profiles')
            .select('*')
            .eq('mobile_number', phone)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Citizen not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCitizenById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('citizen_profiles')
            .select('*')
            .eq('citizen_id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Citizen not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
