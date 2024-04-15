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
const { root, vscodeExtensions } = require('./paths');
const fs = require('fs');
const path = require('path');
const { computeVersion } = require('./version');

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
        const filePath= path.resolve(extensionDir, file);
        archive.file(filePath, {
            name: path.join(path.basename(extensionDir), file),
            mode: (await fs.promises.stat(filePath)).mode
        });
    }
}

const excludedDirs= [ 'vscode-colorize-tests', 'vscode-api-tests',  'microsoft-authentication' ]

async function run() {
    const version = await computeVersion('latest');
    const zipFile = root(`vscode-built-ins-${version}.src.zip`);

    const archive = archiver('zip');
    const output = fs.createWriteStream(zipFile, { flags: "w" });
    archive.pipe(output);

    const dirs= await fs.promises.readdir(vscodeExtensions());
    for (dir of dirs) {
        if (!excludedDirs.includes(dir)) {
            await addExtensionToArchive(archive, path.resolve(vscodeExtensions(), dir));       
        }
    } 

    await archive.finalize();
}

run();
