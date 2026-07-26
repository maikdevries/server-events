interface Event {
	'data': unknown;
}

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

	send(event: Event): void {
		if (!this.#controller) throw new Error();

		const message = `data: ${event.data}`;
		this.#controller.enqueue(new TextEncoder().encode(message + '\n\n'));
	}
}
