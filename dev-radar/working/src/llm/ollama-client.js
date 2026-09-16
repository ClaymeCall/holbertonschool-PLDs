export const DEFAULT_LOCAL_MODEL = 'qwen2.5-coder:3b';

export class OllamaClient {
  constructor({ baseUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434', model = process.env.OLLAMA_MODEL || DEFAULT_LOCAL_MODEL } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
  }

  async health() {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) throw new Error(`OLLAMA_HTTP_${response.status}`);
    return response.json();
  }

  async generate(prompt) {
    if (!this.model) throw new Error('OLLAMA_MODEL_MISSING');
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: { temperature: 0 }
      })
    });
    if (!response.ok) throw new Error(`OLLAMA_HTTP_${response.status}`);
    const data = await response.json();
    return data.response || '';
  }
}
