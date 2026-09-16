import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getBaseFeed, sourceHealth } from '../src/sources/source-engine.js';

const server = new Server({ name: 'dev-radar-sources', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [
  {
    name: 'get_tech_signals',
    description: 'Retourne les signaux techniques du fournisseur local DEV RADAR.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50 } } }
  },
  {
    name: 'get_source_health',
    description: 'Retourne l etat des sources de veille.',
    inputSchema: { type: 'object', properties: {} }
  }
] }));

server.setRequestHandler(CallToolRequestSchema, async req => {
  if (req.params.name === 'get_tech_signals') {
    const limit = Number(req.params.arguments?.limit || 20);
    return { content: [{ type: 'text', text: JSON.stringify(getBaseFeed().slice(0, limit), null, 2) }] };
  }
  if (req.params.name === 'get_source_health') {
    return { content: [{ type: 'text', text: JSON.stringify(sourceHealth(), null, 2) }] };
  }
  throw new Error('UNKNOWN_TOOL');
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('DEV RADAR MCP source server ready on stdio');
