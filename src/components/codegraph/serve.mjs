import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

function startCodegraphServer() {
  const server = new Server({ name: 'codegraph', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: 'codegraph_search', description: 'Structural code search', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
      { name: 'codegraph_relate', description: 'Find related symbols', inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] } },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name === 'codegraph_search') {
      return { content: [{ type: 'text', text: JSON.stringify({ results: [] }) }] };
    }
    if (req.params.name === 'codegraph_relate') {
      return { content: [{ type: 'text', text: JSON.stringify({ related: [] }) }] };
    }
    return { content: [{ type: 'text', text: 'unknown tool' }], isError: true };
  });

  const transport = new StdioServerTransport();
  server.connect(transport);
}

startCodegraphServer();
