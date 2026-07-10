import { describe, it, expect } from 'vitest';
import { LspClient } from '../../../src/components/lsp/lsp-client.js';
import { MockLspTransport } from '../../../src/components/lsp/transport.js';

describe('LspClient', () => {
  it('initializes and receives diagnostics', async () => {
    const transport = new MockLspTransport([
      { jsonrpc: '2.0', id: 1, result: { capabilities: {} } },
    ]);

    let sentDiagnostics = false;
    transport.onSend((msg) => {
      if (msg.method === 'textDocument/didOpen' || msg.method === 'textDocument/didChange') {
        if (sentDiagnostics) return undefined;
        sentDiagnostics = true;
        return {
          jsonrpc: '2.0',
          method: 'textDocument/publishDiagnostics',
          params: {
            uri: 'file:///tmp/test.ts',
            diagnostics: [{ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }, severity: 1, message: 'err' }],
          },
        };
      }
      return undefined;
    });

    const client = new LspClient(transport);
    await client.initialize('file:///tmp/');
    client.openDocument('file:///tmp/test.ts', 'typescript', 'const x = 1;');
    const diagnostics = await client.requestDiagnostics('file:///tmp/test.ts');
    expect(diagnostics).toHaveLength(1);
    client.close();
  });
});
