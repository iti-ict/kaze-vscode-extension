## README

This is a tool… TBC por Paco

The current version of **kaze-vscode-extension** code has some software dependencies that can not be currently resolved due to restricted access. For this reason, in this version you cannot build **kaze-vscode-extension** from the source code. Nevertheless, in the **dist** folder you will have access to two packaged distributions of **kaze-vscode-extension** ready to be used, one for Linux systems and another for Mac systems. Enjoy yourself!

### Documentation

In this [link]() you can find info about how to use kaze-vscode-extension tool.

# ManiGen
-------

Graphic generation of manifests.

'''''
[[requirements]]
### Requirements:

[cols=",",options="header",]
|=================
|Name |Version
|nvm |---
|VS Code |v 1.16.0
|node |v 8.2.1
|npm |v 5.3.0
|=================
'''''
[[install-nvm]]
### Install nvm:

[source,sh]
----
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash
----
'''''
[[install-node]]
###  Install node:


[source,sh]
----
nvm install 8.2
nvm use 8.2
----
'''''
[[install-dependencies]]
### Install dependencies:

[source,sh]
----
$ cd manigen
$ npm install
----

'''''
[[usage-developers]]
## Usage:

'''''
[[dev-browser-mode]]
####  Installation:

[source,sh]
----
$ cd dist && sh manigen_installer.sh
----
* Open a project that contains manifests of an service and some components
* Press Shift+P and execute the command ""

'''''
[[vs-code-mode]]

#### VS Code Dev mode:

[source,sh]
----
$ npm run build #to generate js on the fly
----

* Open this project with VS Code, press F5 and wait for a new VS Code
window. *In this new window open a project that contains manifests of an
service and some components*
* Press Shift+P and execute the command "SaaSDK Manifest Editor"
* In this environment the data are collected from the project manifests.

'''''

__________________________________________________________________________________________________
[[documentation]]
Documentation

* https://vuejs.org/v2/guide/[Vue 2 Documentation]
* https://www.youtube.com/playlist?list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa[Vue
2 Youtube Tutorial]
* https://vuex.vuejs.org/en/intro.html[VueX Documentation]
* https://www.youtube.com/playlist?list=PL4cUxeGkcC9i371QO_Rtkl26MwtiJ30P2[VueX
Youtube Tutorial]
* https://code.visualstudio.com/docs/extensions/example-hello-world[VS
Code Extension Example]
__________________________________________________________________________________________________


### Disclaimer

The current version of **kaze-vscode-extension** code has some software dependencies that can not be currently resolved due to restricted access. For this reason, in this version you cannot build **kaze-vscode-extension** from the source code. Nevertheless, in the **dist** folder you will have access to two packaged distributions of **kaze-vscode-extension** ready to be used, one for Linux systems and another for Mac systems.

### Support advice

The **kaze-vscode-extension** software has been developed in the project *SaaSDK: Tools & Services for developing and managing software as a service over a PaaS (SaaSDK: Herramientas y servicios para el desarrollo y gestión de software como servicio sobre un PaaS)* jointly financed by Instituto Valenciano de Competitividad Empresarial (IVACE) and European Union through the European Regional Development Fund with grant number IMDEEA/2017/141.