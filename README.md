# software-update-checker

![build](https://img.shields.io/endpoint?url=https://aboe026.github.io/shields.io-badge-results/badge-results/software-update-checker/main/build.json)
![coverage](https://img.shields.io/endpoint?url=https://aboe026.github.io/shields.io-badge-results/badge-results/software-update-checker/main/coverage.json)

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

Reference the following files for what software configurations should look like based on your platform:

- [Linux](example-configurations/linux-example-configurations.md)
- [MacOS](example-configurations/macos-example-configurations.md)
- [Windows](example-configurations/windows-example-configurations.md)

---

## Development

Want to modify software-update-checker yourself? Follow these steps below:

### Requirements

- [Node.js](https://nodejs.org/)
- [Powershell](https://docs.microsoft.com/en-us/powershell/) for [e2e tests](#end-to-end-tests)

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

This project is configured to be linted with [ESLint](https://eslint.org/) to make sure code is syntactially correct, and also uses [Prettier](https://prettier.io/) to make sure code is formatted consistently. Jenkinsfiles are linted with [npm-groovy-lint](https://www.npmjs.com/package/npm-groovy-lint).

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

This will [lint](#lint) the project, then run [unit](#unit-tests), [functional](#functional-tests), and [e2e](#end-to-end-tests) tests.

#### Unit Tests

Unit tests are for stateless logic tests on small, contained parts of the code base (ideally not reliant on/mock anything outside their scope), and can be run with

```sh
npm run test:unit
```

_Note_: To run a specific test, execute

```sh
npm run test:unit -- -t 'test name'
```

With spaces separating describe blocks and test names

#### Functional Tests

Functional tests are for portions of the code that cannot easily be mocked or rely on elements outside their scope, such as executables and interacting with a live website. They can be run with

```sh
npm run test:func
```

_Note_: To run a specific test, execute

```sh
npm run test:func -- -t 'test name'
```

With spaces separating describe blocks and test names

#### End to End Tests

End to End (E2E) Tests run against the final, distributable executable and are meant to test overarching scenarios of the tool to simulate as close as possible the real interactions and use/edge cases.

They required code to be [packaged](#package), and can be run with

```sh
npm run test:e2e
```

_Note_: To run a specific test, execute

```sh
npm run test:e2e -- -t 'test name'
```

With spaces separating describe blocks and test names

E2E test execution can be configured with the following environment variables:

| Name                      | Required | Default   | Description                                                                                                                  | Example(s) |
| ------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| E2E_EXEC_MIN_QUIET_PERIOD | yes      | 250       | The minimum amount of time (in milliseconds) that the E2E interactive execution should wait before sending prompt responses. | 300        |
| E2E_LOCAL_IP_ADDRESS      | yes      | 127.0.0.1 | The IP address of the machine running the E2E tests                                                                          | ::1        |

### Code Coverage

By default, code coverage will be generated for unit and functional tests in the `coverage` directory in `unit` and `func` sub-directories respectively. Their individual coverages can be merged into an overall coverage report with

```sh
npm run coverage:merge
```

There is no code coverage for [e2e](#end-to-end-tests) tests as those do not run against source code, but binaries.

To view code coverage in the browser, run

```sh
npm run coverage:view
```

Append `:unit` or `:func` to view coverage for [unit](#unit-tests) or [functional](#functional-tests) tests only, respectively.
