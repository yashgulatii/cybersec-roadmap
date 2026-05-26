const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function fetchFlavorRotation(tasks) {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'flavor', payload: { tasks } })
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
