# Publishing VS Code built-in Extensions for a given VS Code Version
Publishing the VS Code built-in extensions for a given relase of VS Code entails multiple steps (in order)

1. Performm IP-checks with the Eclipse foundation for the extensions included in the VS Code repo ("builtin")
2. Perform IP-checks with the Eclipse foundation for each extension that is included with VS Code, but with source in a different location ("external")
3. Build and test & package the built-ins with the latest Theia version
4. Publish the extensions from the VS Code repo to open-vsx.org

1. ## IP checks for VS Code built-ins
To prepare for the IP checks, you'll have to perform the setup steps from [Building.md](./Building.md#setup)