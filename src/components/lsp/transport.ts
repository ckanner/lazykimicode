import { spawn, type ChildProcess } from 'node:child_process';

export interface LspMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface LspTransport {
  send(message: LspMessage): void;
  onMessage(handler: (message: LspMessage) => void): void;
  onError(handler: (error: Error) => void): void;
  onClose(handler: () => void): void;
  close(): void;
}

export class StdioLspTransport implements LspTransport {
  private process: ChildProcess;
  private buffer = '';
  private messageHandler?: (message: LspMessage) => void;
  private errorHandler?: (error: Error) => void;
  private closeHandler?: () => void;

  constructor(process: ChildProcess) {
    this.process = process;
    this.process.stdout?.setEncoding('utf-8');
    this.process.stdout?.on('data', (chunk: string) => this.onData(chunk));
    this.process.stderr?.on('data', (_chunk: string) => {
      // stderr is often noisy; ignore unless debugging
    });
    this.process.on('error', (err) => this.errorHandler?.(err));
    this.process.on('exit', () => this.closeHandler?.());
  }

  static spawn(command: string, args: string[], cwd?: string): StdioLspTransport {
    return new StdioLspTransport(spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] }));
  }

  send(message: LspMessage): void {
    const body = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n`;
    this.process.stdin?.write(header + body);
  }

  onMessage(handler: (message: LspMessage) => void): void {
    this.messageHandler = handler;
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  onClose(handler: () => void): void {
    this.closeHandler = handler;
  }

  close(): void {
    this.process.kill();
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    while (true) {
      const headerMatch = this.buffer.match(/Content-Length: (\d+)\r\n\r\n/);
      if (!headerMatch) break;
      const contentLength = parseInt(headerMatch[1], 10);
      const headerEnd = headerMatch.index! + headerMatch[0].length;
      if (this.buffer.length < headerEnd + contentLength) break;
      const body = this.buffer.slice(headerEnd, headerEnd + contentLength);
      this.buffer = this.buffer.slice(headerEnd + contentLength);
      try {
        const message = JSON.parse(body) as LspMessage;
        this.messageHandler?.(message);
      } catch {
        // ignore malformed messages
      }
    }
  }
}

export class MockLspTransport implements LspTransport {
  private messageHandler?: (message: LspMessage) => void;
  private errorHandler?: (error: Error) => void;
  private closeHandler?: () => void;
  private responses: Map<number | string, LspMessage> = new Map();
  private onSendHandler?: (message: LspMessage) => LspMessage | undefined;
  private nextId = 1;

  constructor(responses: LspMessage[] = []) {
    for (const msg of responses) {
      if (msg.id !== undefined) this.responses.set(msg.id, msg);
    }
  }

  onSend(handler: (message: LspMessage) => LspMessage | undefined): void {
    this.onSendHandler = handler;
  }

  send(message: LspMessage): void {
    if (this.onSendHandler) {
      const reply = this.onSendHandler(message);
      if (reply) {
        setImmediate(() => this.messageHandler?.(reply));
        return;
      }
    }
    if (message.id !== undefined && this.responses.has(message.id)) {
      const response = this.responses.get(message.id)!;
      setImmediate(() => this.messageHandler?.(response));
    }
  }

  onMessage(handler: (message: LspMessage) => void): void {
    this.messageHandler = handler;
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  onClose(handler: () => void): void {
    this.closeHandler = handler;
  }

  close(): void {
    this.closeHandler?.();
  }

  allocateId(): number {
    return this.nextId++;
  }
}
