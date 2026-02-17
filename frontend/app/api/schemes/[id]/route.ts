import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { data, error } = await supabaseServer
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
        if (!data) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

        // Map junction results to required_documents for frontend
        const formattedData = {
            ...data,
            required_documents: data.scheme_documents?.map((sd: any) => ({
                doc_name: sd.documents?.doc_name,
                mandatory: sd.mandatory
            })) || []
        };

        return NextResponse.json(formattedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
