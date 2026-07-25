export class Stream {
	#controller: ReadableStreamDefaultController<Uint8Array> | null = null;
	#stream: ReadableStream<Uint8Array>;

	constructor() {
		this.#stream = new ReadableStream({
			'start': (controller) => this.#controller = controller,
		});
	}

	get response(): Response {
		return new Response(this.#stream, {
			'headers': {
				'Cache-Control': 'no-cache',
				'Content-Type': 'text/event-stream',
			},
		});
	}

	send(data: unknown): void {
		if (!this.#controller) throw new Error();

		const event = `data: ${data}`;
		this.#controller.enqueue(new TextEncoder().encode(event + '\n\n'));
	}
}
