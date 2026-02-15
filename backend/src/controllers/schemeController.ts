
import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const getAllSchemes = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('schemes')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSchemeById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('schemes')
            .select(`
                *,
                scheme_documents (
                    mandatory,
                    documents (
                        doc_id,
                        doc_name,
                        doc_type,
                        issuing_authority
                    )
                )
            `)
            .eq('scheme_id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Scheme not found' });

        // Map junction results to required_documents for frontend
        const formattedData = {
            ...data,
            required_documents: data.scheme_documents?.map((sd: any) => ({
                doc_name: sd.documents?.doc_name,
                mandatory: sd.mandatory
            })) || []
        };

        res.json(formattedData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
