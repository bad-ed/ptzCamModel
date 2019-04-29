const packageJson = require('../package-lock.json');

const externals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'redux': 'Redux',
    'react-redux': 'ReactRedux',
    'three': 'THREE',
    'katex': 'katex',
};

const externalsPaths = {
    'react': 'umd/react.production.min.js',
    'react-dom': 'umd/react-dom.production.min.js',
    'redux': 'redux.min.js',
    'react-redux': 'react-redux.min.js',
    'three': 'three.min.js',
    'katex': 'katex.min.js'
};

const alternativeLibNameInCDN = {
    'three': 'three.js',
    'katex': 'KaTeX',
};

export type KnownExternals = (keyof typeof externalsPaths) & (keyof typeof externals);

const processVersion = (libName: KnownExternals, version: string) => {
    if (libName === 'three') {
        return version.split('.')[1];
    }

    return version;
}

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

        const usedVersion = processVersion(pkgName, packageJson.dependencies[pkgName].version);
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
