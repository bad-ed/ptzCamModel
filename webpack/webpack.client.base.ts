import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import { makeBase } from './webpack.config.base';
import { KnownExternals, peekExternalsLinks, peekExternals } from './externals';

const usedExternals: KnownExternals[] = [
    'react', 'react-dom'
];

export const externals = peekExternals([]);
const baseConfig = makeBase(path.resolve(__dirname, '../dist'));

const webpackConfig : webpack.Configuration = {
    ...baseConfig,
    ...{
        entry: {
            app: path.resolve(__dirname, '../src/index.tsx'),
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/index.html'),
                templateParameters: {
                    linksToExternals: peekExternalsLinks(usedExternals)
                }
            })
        ],
        target: 'web'
    }
};

export default webpackConfig;
