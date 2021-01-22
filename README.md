# software-update-checker-cli

A command line interface to check if local software installs have updates.

Tired of opening countless programs to check for updates? So was I, which is why I created this project, which acts as a centralized spot to not only get the versions of your locally installed software, but to get their latest versions, and compare that against your local version to see if you have an update available.

How does it work? You configure a software by specifying a command to execute to produce a version string (e.g. `git --version`), and a URL containing the latest version of that software (e.g. `https://github.com/git-for-windows/git/releases/latest`), specifying a [RegEx Group](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges#using_groups) to extract the exact version strings.

---

## Usage

The command line interface (CLI) tool can be used in both an interactive (with prompts and selections) and non-interactive (with runtime flags) way, depending on usage needs. For ideas on how to configure your software, see the [example configurations](#example-configurations).

### Interactive

Simply run the executable to have a list of options displayed. Select an option and follow the additional prompts. Targets (found with the `--help` flag) can be added with the `--interactive` flag to open to a specific part of the tool. The interactive mode will persist until a user specifies the `Exit` option or closes the command session (with `ctrl + c`).

### Non-Interactive

To see a list of available targets and flags, run the executable with the `--help` flag. All targets have their own `--help` flags to list their specific flags.

### Example Configurations

- [Docker](https://www.docker.com/)

  - type: `Static`
  - command: `docker`
  - arguments: `--version`
  - installed regex: `version (.*),`
  - latest URL: `https://docs.docker.com/engine/release-notes/`,
  - latest regex: `\>(.*)\<\/h2\>`

- [Firefox](https://www.mozilla.org/)

  - type: `Static`
  - command: `C:\Program Files\Mozilla Firefox\firefox.exe`
  - arguments: `--version`
  - installed regex: `Firefox (.*)`
  - latest URL: `https://www.mozilla.org/en-US/firefox/releasenotes/`
  - latest regex: `Version (\d+\.\d+(\.\d+)?)`

- [GIMP](https://www.gimp.org/)

  - type: `Dynamic`
  - command directory: `C:\Program Files\GIMP 2\bin`
  - directory regex: `gimp-\d+\.\d+\.exe`
  - arguments: `--version`
  - installed regex: `version (.*)`
  - latest URL: `https://www.gimp.org/downloads/`
  - latest regex: `The current stable release of GIMP is <b>(.*)<\/b>`

- [Git](https://git-scm.com/)

  - type: `Static`
  - command: `git`
  - arguments: `--version`
  - installed regex: `version (.*)`
  - latest URL: `https://github.com/git-for-windows/git/releases/latest`
  - latest regex: `\/tag\/v(.*?)&quot`

- [Inkscape](https://inkscape.org/)

  - type: `Static`
  - command: `C:\Program Files\Inkscape\bin\inkscape.com`
  - arguments: `--version`
  - installed regex: `Inkscape (.*) \(`,
  - latest URL: `https://inkscape.org/release/`
  - latest regex: `Download Inkscape (.*) \|`

- [MongoDB](https://www.mongodb.com/)

  - type: `Static`
  - command: `mongod`
  - arguments: `--version`
  - installed regex: `version v(.*)`
  - latest URL: `https://www.mongodb.com/try/download/community`
  - latest regex: `(\d+.\d+.\d+) \(current\)`

- [NVM](https://github.com/coreybutler/nvm-windows)

  - type: `Static`
  - command: `nvm`
  - arguments: `version`
  - installed regex: `(.*)`
  - latest URL: `https://github.com/coreybutler/nvm-windows/releases/latest`
  - latest regex: `\/tag\/(.*?)&quot`

- [VS Code](https://code.visualstudio.com/)
  - type: `Static`
  - command: `code`
  - arguments: `--version`
  - installed regex: `(.*)`
  - latest URL: `https://github.com/microsoft/vscode/releases/latest`
  - latest regex: `\/tag\/(.*?)&quot`

---

## Development

Want to modify software-update-checker-cli yourself? Follow these steps below:

### Requirements

- [Node.js](https://nodejs.org/) version 14

### Install Dependencies

To pull down all dependencies required by this project, run

```sh
npm install
```

### Debug

To run the project quickly for development, run

```sh
npm start
```

### Package

To create executables for the project that can be run standalone (without Node.js), run

```sh
npm run dist
```

Executables will be created in the `dist` directory

### Lint

This project is configured to be linted with [ESLint](https://eslint.org/) to make sure code is syntactially correct, and also uses [Prettier](https://prettier.io/) to make sure code is formatted consistently.

To check code for proper syntax and formatting, run

```sh
npm run lint
```

To attempt to fix lint issues automatically, run

```sh
npm run lint:fix
```

### Test

To test the project for regressions, run

```sh
npm test
```

This will [lint](#lint) the project, then run [unit](#unit-tests) and [functional](#functional-tests) tests

#### Unit Tests

Unit tests are for stateless logic tests on small parts of the code base, and can be run with

```sh
npm run test:unit
```

#### Functional Tests

Functional tests run against the final, distributable executable and are meant to test overarching scenarios of the tool to simulate as close as possible real interactions and use/edge cases. They required code to be [packaged](#package), and can be run with

```sh
npm run test:func
```
