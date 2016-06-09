import { appbaseSymbol } from './Appbase'

export class Transport {

	constructor( app ) {
		this[ appbaseSymbol ] = app;
	}

	appbase() {
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
