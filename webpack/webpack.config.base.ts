import * as webpack from 'webpack';

export const makeBase = (outPath: string, publicPath = '', dev = false): webpack.Configuration => ({
    output: {
        filename: '[name]-[chunkhash].js',
        path: outPath,
        publicPath
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    module: {
        rules: [{
            test: /\.tsx?$/,
            use: {
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        ...(dev ? { sourceMap: true } : {})
                    }
                }
            },
            exclude: /node_modules/,
        }, {
            test: /\.svg$/,
            use: {
                loader: 'file-loader',
                options: {
                    name: 'assets/[name].[hash].[ext]'
                }
            }
        }]
    }
});
