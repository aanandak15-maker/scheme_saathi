import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // For now, return a stub response since voice processing
        // requires the full backend with Twilio/audio processing
        return NextResponse.json({
            response: "Voice input processing is currently available through the backend server. Please use text input instead.",
            text: "",
            language: "en"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
