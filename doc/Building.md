# Building VS Code built-in Extensions

## Setup

1. Install the VS Code prerequisites as described in (link)
2. Open a command line inside this repo
3. Set up the version of VS Code you want to build:
    git submodule init
    git submodule update
4. Check out the version of VS code you want to use
    cd vscode
    git checkout <git tag or branch>
5. Install project dependencies
    yarn
    
## Building
Building the exensions from VS Code is done simply with 

    yarn build:extensions

This will compile a production ("minified") version of the built-in extensions into the `vscode/.build` folder. In order to produce unminified versions for debugging,
you will need to edit the build script at `vscode/build/lib/extensions.js`. Find the line that creates the webpack config. It should look like this:
```
const webpackConfig = {
   ...config,
   ...{ mode: 'production' }
};
```
Remove part saying `mode: production` and redo the build

## Packaging

=> add a section about how typescript-langauge-features is patched in vscode-bundle.js and why