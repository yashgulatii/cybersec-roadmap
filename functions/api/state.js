// functions/api/state.js
// Purpose: Handles GET and POST operations to sync full state JSON using Cloudflare KV.
// Handles preflights and CORS dynamically.

export async function onRequestGet(context) {
  try {
    const kv = context.env.TACNET_KV || context.env.ROADMAP_KV;
    if (!kv) {
      throw new Error("KV binding not found under TACNET_KV or ROADMAP_KV");
    }
    
    const raw = await kv.get('operator:yg-01:state');
    
    return new Response(raw || 'null', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestPost(context) {
  try {
    const kv = context.env.TACNET_KV || context.env.ROADMAP_KV;
    if (!kv) {
      throw new Error("KV binding not found under TACNET_KV or ROADMAP_KV");
    }

    const body = await context.request.json();
    
    // Store full state JSON block with expiration of 1 year (31,536,000 seconds)
    await kv.put('operator:yg-01:state', JSON.stringify(body), {
      expirationTtl: 31536000
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
