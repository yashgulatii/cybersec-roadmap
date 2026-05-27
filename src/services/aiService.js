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

export async function fetchWeeklyReview(payload) {
  try {
    const systemPrompt = `You are an AI mission controller tracking a cybersecurity operative's weekly performance.
Analyse the data provided and return ONLY valid JSON, no markdown, no backticks.
Format exactly:
{
  "headline": "one punchy sentence summarising the week (max 12 words)",
  "strongestStat": "stat name that improved most",
  "weakestStat": "stat name that needs most work",
  "insight": "one specific observation about their pattern (max 20 words)",
  "nextWeekFocus": "one specific recommendation (max 15 words)",
  "threatLevel": "GREEN | AMBER | RED based on overall discipline"
}`;

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'weeklyReview',
        payload: {
          ...payload,
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
    console.warn('Weekly review failed:', err.message);
    return null;
  }
}
