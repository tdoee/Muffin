import SemVer from 'semver'
import url from 'url'
import TransportFetch from './plugins/TransportFetch'

export const appbaseSymbol = Symbol( 'Appbase' );
export const appbaseOptionsSymbol = Symbol( 'Options' )
export const appbaseTransportSymbol = Symbol( 'Transport' )

const versionAppbase = process.env.APPBASE_VERSION

export class Appbase {
	constructor( defaultOpts = {} ) {
		let { transport = TransportFetch } = defaultOpts
		this[ appbaseOptionsSymbol ] = {}
		this.set( 'transport', transport )
	}

	/**
	 * Inicializa la aplicación con las opciones definidas.
	 * 
	 * @param  {String} options.apiKey  Clave del servicio.
	 * @param  {String} [options.URL='http://localhost/']   Url del servicio a
	 *                                                      utilizar.
	 * @return {Appbase}                Aplicación ya configurada.
	 */
	initialize( opts = {} ) {
		let { apiKey, url: URL = null, transport: TransportPluginsControl = this.get( 'transport' ) } = opts
		/*
		 * En caso de usar un browser utiliza 
		 */
		if ( URL === null ) {
			if ( Boolean( typeof( window ) !== 'undefined' ) && Boolean( window.location ) ) {
				let loc = url.parse( window.location )
				URL = url.format( {
					protocol: loc.protocol,
					hostname: loc.hostname,
					port: loc.port,
				} )
			} else {
				URL = 'http://localhost/'
			}
		}

		// Set option URL
		if ( URL ) {
			this.set( 'url', URL )
		}

		// Set option apiKey
		if ( apiKey ) {
			this.set( 'apiKey', apiKey )
		}

		// Genera el transportador base para la comunicación
		this[ appbaseTransportSymbol ] = new TransportPluginsControl( this, this.get( 'url' ) )

		return this
	}

	/**
	 * Define una opcion
	 * 
	 * @param {String} name  			Nombre de la opción.
	 * @param {Object} value            Valor que obtiene esta opción.
	 */
	set( name, value ) {
		this[ appbaseOptionsSymbol ][ name ] = value
	}

	/**
	 * Obtiene las opciones definidas.
	 * 
	 * @param  {String} name            Nombre asociado a la opción.
	 * @param  {String} [default=undefined]                 Valor por defecto a
	 *                                                      retornar.
	 * @return {Object}                 Valor asignado a la opción.
	 * @example
	 * conts opt = app.get('my option')
	 *
	 * it (opt === 'valid opt') {
	 *     console.log('option is valid')
	 * } else {
	 *     console.log('option no valid')
	 * }
	 */
	get( name, defaultValue = void 0 ) {
		return this[ appbaseOptionsSymbol ][ name ] || defaultValue
	}

	/**
	 * Numero de la versión de la librería.
	 * 
	 * @return {SemVer}
	 */
	get VERSION() {
		return versionAppbase
	}

	/**
	 * Obtiene el transportador que esta usando el elemento Appbase.
	 *
	 * @return {Transport}              Transportador.
	 */
	get transport() {
		return this[ appbaseTransportSymbol ]
	}

	get database() {}
	get session() {}
}

Appbase.VERSION = versionAppbase
Appbase.initialize = function( ...opts ) {
	let app = new Appbase()
	return app.initialize( ...opts )
}

export default Appbase
