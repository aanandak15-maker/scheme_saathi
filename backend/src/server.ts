
import dotenv from 'dotenv';
import path from 'path';

// Load env from root or local .env - MUST BE BEFORE APP IMPORT
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
});
