- [Docker](https://www.docker.com/)

  - type: `Static`
  - command: `docker`
  - arguments: `--version`
  - installed regex: `version (.*),`
  - latest URL: `https://docs.docker.com/engine/release-notes/`,
  - latest regex: `\>(.*)\<\/h2\>`

- [Docker Desktop for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows)

  - type: `Static`
  - command: `Get-ItemProperty`
  - arguments: `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | select DisplayName,DisplayVersion | where {$_.DisplayName -like "Docker*"}`
  - installed regex: `Docker Desktop (.*)`
  - shell override: `powershell`
  - latest URL: `https://docs.docker.com/docker-for-windows/release-notes/`,
  - latest regex: `Docker Desktop Community (.*)\<\/h2\>`

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
