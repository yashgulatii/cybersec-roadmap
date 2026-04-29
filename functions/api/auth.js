export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const submitted = body.password || '';
    const correct = context.env.PASSWORD || '';

    const match = submitted === correct;

    return new Response(JSON.stringify({ success: match }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
