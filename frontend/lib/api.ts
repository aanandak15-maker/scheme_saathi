
const API_BASE_URL = '/api';

export const api = {
    // schemes
    getSchemes: async () => {
        const res = await fetch(`${API_BASE_URL}/schemes`);
        if (!res.ok) throw new Error('Failed to fetch schemes');
        return res.json();
    },

    getSchemeById: async (id: string) => {
        const res = await fetch(`${API_BASE_URL}/schemes/${id}`);
        if (!res.ok) throw new Error('Failed to fetch scheme');
        return res.json();
    },

    // citizen
    createProfile: async (profileData: any) => {
        const res = await fetch(`${API_BASE_URL}/citizen/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!res.ok) throw new Error('Failed to create profile');
        return res.json();
    },

    searchCitizens: async (query: string, type: string = 'all') => {
        const res = await fetch(`${API_BASE_URL}/citizen/search?query=${encodeURIComponent(query)}&type=${type}`);
        if (!res.ok) throw new Error('Failed to search citizens');
        return res.json();
    },

    searchCitizenByPhone: async (phone: string) => {
        const res = await fetch(`${API_BASE_URL}/citizen/search?phone=${encodeURIComponent(phone)}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to search citizen');
        return res.json();
    },

    getCitizenById: async (id: string) => {
        const res = await fetch(`${API_BASE_URL}/citizen/${id}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch citizen');
        return res.json();
    },

    // eligibility
    checkEligibility: async (profileData: any) => {
        const res = await fetch(`${API_BASE_URL}/check-eligibility`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!res.ok) throw new Error('Failed to check eligibility');
        return res.json();
    },

    // voice
    sendVoiceInput: async (audioDetails: { audioLink?: string, textInput?: string, audioFile?: Blob }) => {
        let body;
        const headers: Record<string, string> = {};

        if (audioDetails.audioFile) {
            const formData = new FormData();
            formData.append('file', audioDetails.audioFile);
            if (audioDetails.textInput) formData.append('textInput', audioDetails.textInput);
            body = formData;
            // Content-Type header is automatically set by browser for FormData
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify({
                audioLink: audioDetails.audioLink,
                textInput: audioDetails.textInput
            });
        }

        const res = await fetch(`${API_BASE_URL}/voice-input`, {
            method: 'POST',
            headers,
            body,
        });
        if (!res.ok) throw new Error('Failed to process voice input');
        return res.json();
    }
};
