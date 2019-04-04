import * as webpack from 'webpack';
import clientConf, { externals } from './webpack.client.base';

const prodConfig: webpack.Configuration = {
    ...clientConf,
    ...{
        externals
    }
}

export default prodConfig;
