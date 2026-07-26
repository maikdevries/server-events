interface Event {
	'data': unknown;
	'type': string;
}

export class Stream {
	#controller: ReadableStreamDefaultController<Uint8Array> | null = null;
	#stream: ReadableStream<Uint8Array>;

	constructor() {
		this.#stream = new ReadableStream({
			'start': (controller) => this.#controller = controller,
			'cancel': this.close.bind(this, { 'notify': false }),
		});
	}

	get connected(): boolean {
		return this.#controller !== null;
	}

	get response(): Response {
		if (this.#stream.locked) throw new Error();

		return new Response(this.#stream, {
			'headers': {
				'Cache-Control': 'no-cache',
				'Content-Type': 'text/event-stream',
				'X-Accel-Buffering': 'no',
			},
		});
	}

	close(options: { 'notify': boolean } = { 'notify': true }): void {
		if (!this.connected) return;

		try {
			if (options.notify) this.send({ 'data': 'server closed connection', 'type': 'close' });
			this.#controller?.close();
		} catch (_: unknown) {}

		this.#controller = null;
	}

	send(event: Event): void {
		if (!this.connected) throw new Error();

		const message = `event: ${event.type}\ndata: ${event.data}`;
		this.#controller?.enqueue(new TextEncoder().encode(message + '\n\n'));
	}
}
