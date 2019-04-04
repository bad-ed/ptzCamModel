const packageJson = require('../package-lock.json');

const externals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'react-bootstrap-typeahead': 'ReactBootstrapTypeahead',
    'axios': 'axios',
    'redux': 'Redux',
    'react-redux': 'ReactRedux',
    'redux-thunk': 'ReduxThunk',
    'react-router-dom': 'ReactRouterDOM',
    'papaparse': 'Papa'
};

const externalsPaths = {
    'react': 'umd/react.production.min.js',
    'react-dom': 'umd/react-dom.production.min.js',
/*    'react-bootstrap-typeahead': 'react-bootstrap-typeahead.min.js',
    'axios': 'axios.min.js',
    'redux': 'redux.min.js',
    'react-redux': 'react-redux.min.js',
    'redux-thunk': 'redux-thunk.min.js',
    'react-router-dom': 'react-router-dom.min.js',
    'papaparse': 'papaparse.min.js'*/
};

const alternativeLibNameInCDN = {
    'papaparse': 'PapaParse'
};

export type KnownExternals = (keyof typeof externalsPaths) & (keyof typeof externals);

export const peekExternalsLinks = (externalNames: KnownExternals[]) => {
    return externalNames.map(pkgName => {
        if (!packageJson.dependencies.hasOwnProperty(pkgName)) {
            console.error(`Package ${pkgName} is not installed`);
            throw new Error(`Package ${pkgName} is not installed`);
        }

        if (!externalsPaths.hasOwnProperty(pkgName)) {
            console.error(`Url for for package ${pkgName} is unknown`);
            throw new Error(`Url for for package ${pkgName} is unknown`);
        }

        const usedVersion = packageJson.dependencies[pkgName].version;
        const cdnPkgName = alternativeLibNameInCDN[pkgName] || pkgName;

        return `https://cdnjs.cloudflare.com/ajax/libs/${cdnPkgName}/${usedVersion}/${externalsPaths[pkgName]}`;
    });
};

export const peekExternals = (externalNames: KnownExternals[]) => {
    let result: { [key in KnownExternals]?: string } = {};

    externalNames.forEach(pkgName => {
        if (!externals.hasOwnProperty(pkgName)) {
            console.error(`Package ${pkgName} is unknown`);
            throw new Error(`Package ${pkgName} is unknown`);
        }

        result[pkgName] = externals[pkgName];
    });

    return result;
};
