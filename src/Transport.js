import { appbaseSymbol } from './Appbase'
import url from 'url'

export class ErrorTransportServer extends Error {
	constructor(name, message, /* Optional!DEV */ stack) {
		super(message)
		this.name = name
		this.message = message
		this.stack = stack
	}
}

export class Transport {
	constructor( app, url = void 0 ) {
		this[ appbaseSymbol ] = app;

		if ( url ) {
			this.url = url
		} else {
			this.url = app.get( 'url' )
		}
	}

	resolveUrl( urlToResolve ) {
		return url.resolve( this.url, urlToResolve )
	}

	get appbase() {
		return this[ appbaseSymbol ]
	}

	request() {}
	push() {}
	update() {}
	set() {}
	remove() {}
	value() {}
}

export default Transport
