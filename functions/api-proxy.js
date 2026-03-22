export async function onRequestOptions({ request }) {
    const origin = request.headers.get('Origin');
    
    let corsHeaders = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
    
    // Echo back the origin for preflight requests if provided
    if (origin) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function onRequestPost({ request, env }) {
    const origin = request.headers.get('Origin');
    
    // Check if the origin is one of the allowed ones
    const isLocalhost = origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));
    const isAllowedDomain = origin === 'https://nordlager-halle.de' || origin === 'https://www.nordlager-halle.de';
    
    // Postman/Server-to-Server usually don't send an origin. We allow them or we strict check. Let's strict check origin if it exists.
    const isAllowed = !origin || isLocalhost || isAllowedDomain;

    let corsHeaders = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (origin) {
        if (!isAllowed) {
            return new Response(JSON.stringify({ error: "Origin not allowed" }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    try {
        const inputJSON = await request.text();

        if (!inputJSON) {
            return new Response(JSON.stringify({ error: "Empty request body" }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        // Get API key from Cloudflare Pages Environment Variables
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API key not configured in environment (GEMINI_API_KEY)" }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: inputJSON
        });

        const responseData = await geminiResponse.text();

        return new Response(responseData, {
            status: geminiResponse.status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error", message: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
