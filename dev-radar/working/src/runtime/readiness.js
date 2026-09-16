export async function checkModelReadiness(client) {
  const start = Date.now();
  try {
    await client.generate('ping');
    const latency = Date.now() - start;
    return { alive: latency < 1000, ready: latency < 1000, latency };
  } catch (error) {
    return { alive: false, ready: false, error: error.message };
  }
}
