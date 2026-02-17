const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
try {
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    } else {
        console.log(".env.local not found");
    }
} catch (e) {
    console.log("Could not read .env.local", e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Missing environment variables.");
    console.error("URL:", supabaseUrl);
    console.error("Key:", supabaseKey ? "EXISTS" : "MISSING");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing connection to:", supabaseUrl);

    // 1. Check Profiles (should exist)
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileError) {
        console.error("❌ Error accessing 'profiles':", profileError.message);
    } else {
        console.log("✅ 'profiles' table accessible.");
    }

    // 2. Check Channels
    const { data: channels, error: channelError } = await supabase
        .from('channels')
        .select('*')
        .limit(1);

    if (channelError) {
        console.error("❌ Error accessing 'channels':", channelError.message, channelError.code);
        if (channelError.code === '42P01') {
            console.log("   -> DIAGNOSIS: The 'channels' table does not exist.");
        }
    } else {
        console.log("✅ 'channels' table accessible. Rows found:", channels ? channels.length : 0);
    }

    // 3. Check Messages
    const { data: messages, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

    if (messageError) {
        console.error("❌ Error accessing 'messages':", messageError.message, messageError.code);
    } else {
        console.log("✅ 'messages' table accessible.");
    }
}

testConnection();
