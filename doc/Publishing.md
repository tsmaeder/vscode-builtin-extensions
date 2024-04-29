# Publishing VS Code built-in Extensions for a given VS Code Version
Publishing the VS Code built-in extensions for a given relase of VS Code entails multiple steps (in order)

1. Perform IP-checks with the Eclipse foundation for the extensions included in the VS Code repo ("builtin")
2. Perform IP-checks with the Eclipse foundation for each extension that is included with VS Code, but with source in a different location ("external")
3. Build and test & package the built-ins with the latest Theia version
4. Publish the extensions from the VS Code repo to open-vsx.org

## IP checks for VS Code built-ins
To prepare for the IP checks, you'll have to perform the setup steps from [Building.md](./Building.md#setup). Now we need 
to first run the [dash-licenses](https://github.com/eclipse/dash-licenses) tool to check the dependencies of the bulit-in 
extensions for compatibility with the Theia license. There are a couple of package scripts helping with this: the following sequence downloads the dash-licenses jar to the current directory and then runs the `dash-licenses` for all relevant extensions in the `vscode/extensions` directory.

    yarn download:dash-licenses
    yarn ip-check:builtin 

This will run the dash-licenses tool an all extensions in the VS Code repo. To automatically open issues with the Eclipse [IP-issue tracker](https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab), you can pass a `--token` parameter to the `ip-check:builtin` script. The token is  described [here](https://github.com/eclipse/dash-licenses?tab=readme-ov-file#automatic-ip-team-review-requests).

    yarn ip-check:builtin --token <your gitlab token>

Any issues will show up as opened by you (or the account owning the token) at https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab. In general, it's a good idea to wait for the 
IP tickets to be closed before publishing the built-in. Technically, this restriction applies to publishing the built-ins as part of an Eclipse project artifact like Theia IDE. 
Now it's time to open an ip-ticket for the source of the VS Code built-ins themselves.

Generate a source zip of the extensions folder. You can use a package script that will prune test extensions and test folders from the source:

    yarn archive:builtin

This will `git clean` all extension directories and generate a zip file named like so: `vscode-builtins-<version>.src.zip`

Open an issue that looks like this: https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab/-/issues/11676. Use the template "vet third party" on the new issue and fill in the templata liek in the example issue. Attach the source file generated in step one as "source". Since there is no real "clearlydefined id" for the built-ins, we set the title of the issue to "project/ecd.theia/-/vscode-builtin-extensions/<VS Code version>"

## IP checks for external VS Code built-ins
We now have to perform the IP checks for the "external builtins". These are extensions which are not develped as part of the VS code repository, but which are still included as part of the
VS Code product. They are described in the `product.json` file which lives at the root of the VS Code repository. There is a package script which will clone the relevant repos and check out
the correct tag into a folder named `external-builtins`.

    yarn get-external-builtin

We now have to run the checks for the dependencies of those extensions:

    yarn ip-check:external --token <your gitlab token>

Again, this will open issues with the Eclipse IP issue tracker. Once this is done, it's time to open an ip-check issue for the content of each of the external built ins.
For extensions from github, it's usually enought to open a "vet third party" issue with just the project in the details, like this one: https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab/-/issues/14430. The title should be the clearlydefined id of the form `git/github/<github org>/<project>/v<version>`. The IP-check bot is usually able to download the source from the github release page on its own. In the issue template, just fill in the "project" field.
If the IP-check bot cannot figure out the source (it will ask for source in a comment on the issue), you can zip up the source of all external built-ins into files of the form `<publisher>.<name>-<version>.src.zip>` with a package script: 

    yarn archive:external

You can then drag the relevant zip into the gitlab issue.

## Produce the VS Code built-ins

Building and packaging the built-ins is described in [Building.md](./Building.md). 


