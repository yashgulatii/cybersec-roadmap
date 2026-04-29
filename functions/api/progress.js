export async function onRequestGet(context) {
  try {
    const data = await context.env.ROADMAP_KV.get('progress');
    const progress = data ? JSON.parse(data) : [];
    
    return new Response(JSON.stringify({ progress }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const submitted = body.password || '';
    const correct = context.env.PASSWORD || '';

    if (submitted !== correct) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!Array.isArray(body.progress)) {
      return new Response(JSON.stringify({ error: 'Invalid data format' }), { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Save the progress array to KV
    await context.env.ROADMAP_KV.put('progress', JSON.stringify(body.progress));

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
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
