/********************************************************************************
 * Copyright (C) 2024 ST Microelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

const archiver = require('archiver');
const { glob } = require('glob');
const { root, vscodeExtensions, vscode, externalBuiltinsRepos } = require('./paths');
const fs = require('fs');
const path = require('path');
const { computeVersion } = require('./version');

const yargs = require('yargs');
const { dir } = require('console');

const { mode } = yargs.option('mode', {
    type: 'string',
    demandOption: true,
    choices: ['builtin', 'external']
}).argv;

/**
 * 
 * @param { archiver.Archiver } zip 
 * @param { string } extensionDir
 */
async function addExtensionToArchive(archive, extensionDir) {
    console.log(`adding extension ${extensionDir}`);
    const filesToInclude = await glob('**', {
        cwd: extensionDir,
        ignore: '**/test/**/*'
    });

    for (const file of filesToInclude) {
        const filePath = path.resolve(extensionDir, file);
        archive.file(filePath, {
            name: path.join(path.basename(extensionDir), file),
            mode: (await fs.promises.stat(filePath)).mode
        });
    }
}

async function archiveExternal() {
    const prod = vscode('product.json');
    const content = fs.readFileSync(prod, 'utf-8');
    /** 
     * vscode product.json section where we find info about external builtins 
     * @type ProductBuiltInExtensionEntry[]
    */
    const prodJsonExts = JSON.parse(content).builtInExtensions || [];
    const entries= new Map(prodJsonExts.map(entry => {
        const names= entry.repo.split("/");
        return [names[names.length-1], entry];
    }));

    const { execa } = await import('execa');

    const rootDir = externalBuiltinsRepos();
    const dirs = await fs.promises.readdir(rootDir);
    for (const dir of dirs) {
        const resolvedDir = path.resolve(rootDir, dir);
        const entry= entries.get(dir);
        process.stdout.write(`cleaning directory: ${resolvedDir}`);
        await execa('git', ['clean', '-xfd'], {
            cwd: resolvedDir,
            stdout: 'inherit'
        });
        process.stdout.write('done\n');

        const zipFile = path.resolve(root(), `${entry.name}-${entry.version}.src.zip`);

        const archive = archiver('zip');
        const output = fs.createWriteStream(zipFile, { flags: "w" });
        archive.pipe(output);
        await addExtensionToArchive(archive, path.resolve(rootDir, dir));
        await archive.finalize();
    }
}

async function archiveBuiltins() {
    const { execa } = await import('execa');

    process.stdout.write('cleaning vscode directory');
    execa('git', ['clean', '-xfd'], {
        cwd: vscode()
    });

    process.stdout.write('done\n');

    const excludedDirs = ['vscode-colorize-tests', 'vscode-api-tests', 'microsoft-authentication']
    const version = await computeVersion('latest');
    const zipFile = root(`vscode-built-ins-${version}.src.zip`);

    const archive = archiver('zip');
    const output = fs.createWriteStream(zipFile, { flags: "w" });
    archive.pipe(output);

    const dirs = await fs.promises.readdir(vscodeExtensions());
    for (dir of dirs) {
        if (!excludedDirs.includes(dir)) {
            await addExtensionToArchive(archive, path.resolve(vscodeExtensions(), dir));
        }
    }

    await archive.finalize();
}

if (mode === 'builtin') {
    archiveBuiltins();
} else {
    archiveExternal();
}
