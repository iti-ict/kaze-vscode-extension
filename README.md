## README

This is the code for the Visual Studio Code Extension what the kaze-cli uses.

The current version of **kaze-vscode-extension** code has some software dependencies that can not be currently resolved due to restricted access. For this reason, in this version you cannot build **kaze-vscode-extension** from the source code. Nevertheless, in the **dist** folder you will have access to two packaged distributions of **kaze-vscode-extension** ready to be used, one for Linux systems and another for Mac systems. Enjoy yourself!

### Documentation

In this [link]() you can find info about how to use kaze-vscode-extension tool.

# ManiGen

Graphic generation of manifests.

### Requirements:

| name | version |
|------|---------|
| nvm  | whatever|
| Visual Studio Code | 1.16.0  |
| Node  | 8.2.1  |
| NPM  | 5.3.0  |


### Install nvm:

```console
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash
```

###  Install node:

```console
nvm install 8.2
nvm use 8.2
```

### Install dependencies:

```console
$ cd manigen
$ npm install
```
## Usage:
####  Installation:

```console
$ cd dist && sh manigen_installer.sh
```

* Open a project that contains manifests of an service and some components
* Press Shift+P and execute the command ""

#### VS Code Dev mode:
```console
$ npm run build #to generate js on the fly
```

* Open this project with VS Code, press F5 and wait for a new VS Code window. 
* In this new window open a project that contains manifests of a service and some components 
* Press Shift+P and execute the command "SaaSDK Manifest Editor"
* In this environment the data are collected from the project manifests.

## Documentation

* https://vuejs.org/v2/guide/  [Vue 2 Documentation]
* https://www.youtube.com/playlist?list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa    [Vue2 Youtube Tutorial]
* https://vuex.vuejs.org/en/intro.html    [VueX Documentation]
* https://www.youtube.com/playlist?list=PL4cUxeGkcC9i371QO_Rtkl26MwtiJ30P2    [VueX Youtube Tutorial]
* https://code.visualstudio.com/docs/extensions/example-hello-world [VSCode Extension Example]
__________________________________________________________________________________________________


### Disclaimer

The current version of **kaze-vscode-extension** code has some software dependencies that can not be currently resolved due to restricted access. For this reason, in this version you cannot build **kaze-vscode-extension** from the source code. Nevertheless, in the **dist** folder you will have access to two packaged distributions of **kaze-vscode-extension** ready to be used, one for Linux systems and another for Mac systems.

### Support advice

The **kaze-vscode-extension** software has been developed in the project *SaaSDK: Tools & Services for developing and managing software as a service over a PaaS (SaaSDK: Herramientas y servicios para el desarrollo y gestión de software como servicio sobre un PaaS)* jointly financed by Instituto Valenciano de Competitividad Empresarial (IVACE) and European Union through the European Regional Development Fund with grant number IMDEEA/2017/141.