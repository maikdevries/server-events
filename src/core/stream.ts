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
		});
	}

	get response(): Response {
		if (this.#stream.locked) throw new Error();

		return new Response(this.#stream, {
			'headers': {
				'Cache-Control': 'no-cache',
				'Content-Type': 'text/event-stream',
			},
		});
	}

	send(event: Event): void {
		if (!this.#controller) throw new Error();

		const message = `event: ${event.type}\ndata: ${event.data}`;
		this.#controller.enqueue(new TextEncoder().encode(message + '\n\n'));
	}
}
