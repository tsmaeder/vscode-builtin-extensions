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

const { promises: fs } = require('fs');
const fetch= require('node-fetch');
const path = require('path');
const glob = require('glob');
const { rgPath } = require('@vscode/ripgrep');

const yargs = require('yargs');

const { token } = yargs.option('token', {
    type: 'string',
}).argv;

glob('vscode/extensions/*/yarn.lock', async (error, files) => {
    const { execa } = await import('execa');

    if (error) {
        console.log(error);
    } else {
        for (file of files) {
            process.stdout.write(`inspecting ${file}...`);
            try {
                const javaArgs= ['-jar', 'dash-licenses.jar', '-summary', 'summary.txt'];
                if (token) {
                    javaArgs.push('-review', '-token', token);
                }
                javaArgs.push(file);
                await execa('java', javaArgs);
                process.stdout.write('OK\n');
            } catch (e) {
                // ignore
                process.stderr.write('\x1b[31mFailures\x1b[0m\n');
            }

            try {
                const  result = execa(rgPath, ['restricted', 'summary.txt']);
                for await (const line of result) {
                    console.log(line);
                }
            } catch (e) {
            }

        }
    }
});