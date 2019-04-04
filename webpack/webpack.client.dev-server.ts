/**
 * @copyright 2017 ELVEES NeoTek JSC. All rights reserved.
 * Closed source software. Actual software is delivered under the license agreement and (or) non-disclosure
 * agreement. All software is copyrighted by ELVEES NeoTek JSC (Russia) and may not be copied, publicly
 * transmitted, modified or distributed without prior written authorization from the copyright holder.
 */
import * as url from 'url';
import * as os from 'os';
import * as path from 'path';

//import * as Config from './webpack.config.base';
import config from './webpack.client.base';
import * as WebpackDevServer from 'webpack-dev-server';

// Default rpc port
const DEFAULT_RPC_PORT = 8080;

export default function(env, argv) {
	env = {
		...{
			DEV_PORT: 8081,
			PROXY: `http://localhost:${DEFAULT_RPC_PORT}`
		},
		...env
	};

	config.devtool = 'inline-source-map';
	config.mode = 'development';

	// Export webpack-dev-server config
	config.devServer = makeDevServerConfig({
		rpcEndpointUrl: getEndpointUrl(env),
		devPort: env.DEV_PORT
	});

	// Add style entry
	return config;
}

function getEndpointUrl(env): string {
	// Find out rpc endpoint url
	let rpcEndpointUrl = null;

	if (env.PROXY) {
		let parsedUrl = url.parse(env.PROXY);

		if (!parsedUrl.hostname) {
			throw new Error('Unable to parse specified proxy url');
		}

		if (!parsedUrl.port) {
			parsedUrl.port = `${DEFAULT_RPC_PORT}`;
		}

		rpcEndpointUrl = `${parsedUrl.hostname}:${parsedUrl.port}`;
	} else {
        throw new Error('No proxy specified');
    }

	return rpcEndpointUrl;
}

function makeDevServerConfig(config: {rpcEndpointUrl: string, devPort: number}): WebpackDevServer.Configuration {
	let devServerConfig : WebpackDevServer.Configuration = {
		// Instead of answering with 404 return contents of index.html to client
		historyApiFallback: {
			rewrites: [{
				from: /^(?!.*\.js$).*/,
				to: '/index.html'
			}]
		},

		// Port on which webpack-dev-server will listen
		port: config.devPort,

		// Redirect requests to /query and /events to specified endpoint
		proxy: {
			// ajax
			'/api': `http://${config.rpcEndpointUrl}`,
			'/auth': `http://${config.rpcEndpointUrl}`,
		}
	};

	return devServerConfig;
}
