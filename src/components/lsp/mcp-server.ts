import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runDiagnostics, createTransport } from './diagnostics.js';

export function startLspServer() {
  const server = new Server({ name: 'lsp', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: 'lsp_status', description: 'LSP server status', inputSchema: { type: 'object', properties: {}, required: [] } },
      { name: 'lsp_diagnostics', description: 'Get diagnostics for a file', inputSchema: { type: 'object', properties: { file: { type: 'string' } }, required: ['file'] } },
      { name: 'lsp_goto_definition', description: 'Go to definition', inputSchema: { type: 'object', properties: { file: { type: 'string' }, line: { type: 'number' }, character: { type: 'number' } }, required: ['file', 'line', 'character'] } },
      { name: 'lsp_find_references', description: 'Find references', inputSchema: { type: 'object', properties: { file: { type: 'string' }, line: { type: 'number' }, character: { type: 'number' } }, required: ['file', 'line', 'character'] } },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const lspCommand = process.env.OMO_KIMI_LSP_COMMAND;
    const lspArgs = process.env.OMO_KIMI_LSP_ARGS?.split(' ') ?? [];

    switch (req.params.name) {
      case 'lsp_status': {
        const transport = lspCommand ? createTransport(lspCommand, lspArgs) : undefined;
        const status = transport ? 'ready' : 'no LSP configured';
        transport?.close();
        return { content: [{ type: 'text', text: status }] };
      }
      case 'lsp_diagnostics': {
        const file = (req.params.arguments as { file: string }).file;
        const transport = lspCommand ? createTransport(lspCommand, lspArgs) : undefined;
        try {
          const diagnostics = transport ? await runDiagnostics(file, transport) : [];
          return { content: [{ type: 'text', text: JSON.stringify({ diagnostics }) }] };
        } finally {
          transport?.close();
        }
      }
      case 'lsp_goto_definition':
        return { content: [{ type: 'text', text: JSON.stringify({ locations: [] }) }] };
      case 'lsp_find_references':
        return { content: [{ type: 'text', text: JSON.stringify({ locations: [] }) }] };
      default:
        return { content: [{ type: 'text', text: 'unknown tool' }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  server.connect(transport);
}
