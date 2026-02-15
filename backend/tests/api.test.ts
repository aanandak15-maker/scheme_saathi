import request from 'supertest';
import app from '../src/app';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
    const m = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { scheme_id: 'SCH001' }, error: null }),
        insert: jest.fn().mockReturnThis(),
        match: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    // Make the entire object a thenable that resolves to a default success state
    (m as any).then = (cb: any) => Promise.resolve({ data: [{ scheme_id: 'SCH001' }], error: null }).then(cb);
    return { createClient: jest.fn(() => m) };
});

describe('API Integration Tests', () => {
    test('GET /health should return 200', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    test('GET /api/schemes should return schemes list', async () => {
        // Need to adjust the mock if we want specific data
        const response = await request(app).get('/api/schemes');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/check-eligibility should handle batch check', async () => {
        const sampleProfile = {
            full_name: 'Test Citizen',
            age: 30,
            location: { area_type: 'Rural' },
            occupation: { primary_occupation: 'Farmer', is_bpl: true }
        };

        const response = await request(app)
            .post('/api/check-eligibility')
            .send(sampleProfile);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('eligible_schemes');
        expect(response.body).toHaveProperty('summary');
    });
});
