export async function onRequest(context) {
    const { request, env } = context;
    const origin = request.headers.get('Origin');

    // 1. Erlaube alle Methoden
    let corsHeaders = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 2. Sicherheits-Check (CORS)
    const isLocalhost = origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));
    const isAllowedDomain = origin === 'https://nordlager-halle.de' || origin === 'https://www.nordlager-halle.de';
    const isAllowed = !origin || isLocalhost || isAllowedDomain;

    if (origin && isAllowed) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    // 3. Preflight-Check (Der Browser fragt vorher an, ob er POSTen darf)
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 4. Test-Route (Unser GET-Test von vorhin)
    if (request.method === "GET") {
        return new Response("Der Proxy funktioniert jetzt für ALLE Methoden (GET, POST, OPTIONS)!", {
            status: 200,
            headers: corsHeaders
        });
    }

    // 5. Die eigentliche KI-Anfrage (POST)
    if (request.method === "POST") {
        // Blockiere fremde Domains
        if (origin && !isAllowed) {
            return new Response(JSON.stringify({ error: "Origin not allowed" }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            const inputJSON = await request.text();

            if (!inputJSON) {
                return new Response(JSON.stringify({ error: "Empty request body" }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // Hole Key aus den Cloudflare Einstellungen
            const apiKey = env.GEMINI_API_KEY;
            if (!apiKey) {
                return new Response(JSON.stringify({ error: "API key is missing in Cloudflare" }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // Weiterleitung an Google
            const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

            const geminiResponse = await fetch(googleApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Falls jemand etwas anderes als GET, POST oder OPTIONS schickt
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
}