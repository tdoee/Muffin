import PathExec from 'path-exec'
import waterfall from 'async/waterfall'
import AppbaseError from './AppbaseError'
import mime from 'mime'

let normalizePath = (p) => p.split('/').filter(Boolean).join('/')

let SymbolPaths = Symbol( 'paths' )

export class Storage {
	constructor (appbase) {
		this.appbase = appbase
	}

	on(cb) {
		this.appbase
			.transport
			.request('storage/(.*)', (params, head, body, next) => {
				let {action, path, value:{/* Buffer file */file, metadata = {}}} = head.body

				let [,ref] = /^storage\/(.*)/.exec(normalizePath(path))

				try {
					cb(ref, file, /* Callback */ (err, /* Array out spec file */ spec) => {
						if (err) return next(err)
						// if (!Array.isArray(spec)) return next(new TypeError('Spec returns is false'))

						body.upload = spec

						next(null)
					})
				} catch (ex) {
					next(ex)
				}
			})
	}
}

export class Reference {
	constructor (appbase, preventcb) {
		this.appbase = appbase
		this.preventcb = preventcb
	}

	/* Use to all request */
	on(cb) {
		this.appbase
			.transport
			.request('database/(.*)', (params, head, body, next) => {
				let {path, action, value, query} = head.body

				/* Get Path to reference */
				let [,ref] = /^database\/(.*)$/.exec(normalizePath(path))

				// console.log(`use this ref: ${ref}`)
				/* Variable de Transferencia */
				let t = {}
				/* Transfer Header */
				let thead = {ref, value, head, query}

				waterfall([
					/* Use preventcb */
					nextStep => {
						try {
							this.preventcb(thead, (err, progress = false) => {
								if (err) nextStep(err)

								if (progress === true) {
									nextStep()
								} else{
									nextStep(new Error('Is disabled this request'))
								}
							})
						} catch (ex) {
							nextStep(ex)
						}
					},
					/* Use the callback to this method */
					stepEnd => {
						try {
							cb(action, thead, (err, data) => {
								if (err) stepEnd(err)
								else {
									body[`ref.${action}`] = data
									stepEnd()
								}
							})
						} catch (ex) {
							stepEnd(ex)
						}
					},
				], (err) => {
					if (err) next(err)
					else next()
				})
			})
	}
}

export class Database {
	constructor(appbase) {
		this.appbase = appbase

		this[ SymbolPaths ] = new PathExec()
	}

	ref(cb = false) {
		// cb && this.appbase
		// 	.transport
		// 	.request('database/(.*)', (params, head, body, next) => {
		// 		let {path} = head.body

		// 		// Get reference by path
		// 		let [,ref] = /^\/?database\/(.*)$/.exec(path)

		// 		cb(ref, /* next */ (err, data) => {
		// 			if (err) next(err)
		// 			else {
		// 				body.database = data
		// 				next()
		// 			}
		// 		})
		// 	})

		return new Reference(this.appbase, cb)
	}
}

export class Auth {
	constructor( appbase ) {
		this.appbase = appbase
	}

	signInWithEmail( cb ) {
		this.appbase
			.transport
			.request('auth/signInWithEmail', (params, head, body, next) => {
				cb(head.body.data.email, (err, session /* define a id by session */) => {
					if (err) {
						next(err)
					} else {
						body.session = session // Send Session id
						next()
					}
				})
			})
	}

	signInWithCodeTokenId( cb ) {
		this.appbase
			.transport
			.request('auth/signInWithCodeTokenId', (params, head, body, next) => {
				let {tokenId, code} = head.body.data

				cb(tokenId, code, (err, session) => {
					if (err) {
						next(err)
					} else {
						body.session = session
						next()
					}
				})
			})
	}

	pullCurrenUser(cb) {
		this.appbase
			.transport
			.request('auth/currenUser', (params, head, body, next) => {
				let { tokenId } = head

				cb(tokenId, (err, session) => {
					if (err) { next(err) }
					else {
						body.session = session
						next()
					}
				})
			})
	}

	checkToken(cb) {
		this.appbase
			.transport
			.request('session/check', (params, head, body, next) => {
				let { tokenId } = head

				cb(tokenId, (err, session) => {
					if (err) {
						next(err)
					} else {
						body.session = session
						next()
					}
				})
			})
	}

}

/*
Maneja todoas las entras desde el servidor
 */
export class Server {
	constructor( opts = {} ) {
		let { transport } = opts
		this[ SymbolPaths ] = new PathExec()
		this.transport = transport

		this.auth = new Auth( this )
		this.database = new Database( this )
		this.storage = new Storage( this )
	}
}

export default Server
