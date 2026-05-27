const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function fetchFlavorRotation(tasks) {
  try {
    const systemPrompt = `You are a mission commander for a cybersecurity operative. 
Each day you reframe the operative's tasks with fresh cyberpunk/military ops language.
The core objective must stay identical — only the framing, urgency, and tone change.
Vary the style each call: sometimes terse and cold, sometimes intense and motivational, sometimes cryptic.
Return ONLY a valid JSON object, no markdown, no backticks, no explanation.
Format exactly: { "taskId": { "title": "rewritten title max 8 words", "briefing": "one punchy line under 15 words" } }`;

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'flavor',
        payload: {
          tasks,
          systemPrompt,
          system_prompt: systemPrompt,
          system: systemPrompt
        }
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const clean = data.result.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.warn('Flavor rotation failed:', err.message);
    return null;
  }
}

export async function fetchDailyDebrief(payload) {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'debrief', payload })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.result;
  } catch (err) {
    console.warn('Debrief failed:', err.message);
    return 'COMMS ERROR: Commander unavailable. File your own report.';
  }
}
