- [Chrome](https://www.google.com/chrome/)

  - type: `Static`
  - shell: `powershell`
  - command: `Get-ItemProperty`
  - arguments: `HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion`
  - installed regex: `Google Chrome\s+(\S+)\s+`
  - latest URL: `https://www.softpedia.com/get/Internet/Browsers/Google-Chrome.shtml`
  - latest regex: `Download Google Chrome ([^\s]+) `

- [Docker Desktop for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows)

  - type: `Static`
  - shell: `powershell`
  - command: `Get-ItemProperty`
  - arguments: `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | select DisplayName,DisplayVersion | where {$_.DisplayName -like "Docker*"}`
  - installed regex: `Docker Desktop (.*)`
  - latest URL: `https://docs.docker.com/desktop/windows/release-notes/`,
  - latest regex: `>Docker Desktop (.*)<\/h2>`

- [Edge](https://www.microsoft.com/en-us/edge?r=1)

  - type: `Static`
  - shell: `powershell`
  - command: `Get-ItemProperty`
  - arguments: `HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion`
  - installed regex: `Microsoft Edge\s+(\S+)\s+`
  - latest URL: `https://www.catalog.update.microsoft.com/Search.aspx?q=edge%20stable`
  - latest regex: `Microsoft Edge-Stable Channel Version.*for x64 based Editions \(Build (.*)\)`

- [Firefox](https://www.mozilla.org/)

  - type: `Static`
  - shell: `powershell`
  - command: `Get-ItemProperty`
  - arguments: `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion`
  - installed regex: `Mozilla Firefox \(x64 en-US\)\s+(\S+)\s+`
  - latest URL: `https://www.mozilla.org/en-US/firefox/releasenotes/`
  - latest regex: `Version (\d+\.\d+(\.\d+)?)`

- [GIMP](https://www.gimp.org/)

  - type: `Dynamic`
  - directory: `C:\Program Files\GIMP 2\bin`
  - regex: `gimp-\d+\.\d+\.exe`
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
  - directory: `C:\Program Files\Inkscape\bin`
  - command: `inkscape.com`
  - arguments: `--version`
  - installed regex: `Inkscape (.*) \(`,
  - latest URL: `https://inkscape.org/release/`
  - latest regex: `/release/(.*)/platforms/`

- [MongoDB](https://www.mongodb.com/)

  - type: `Static`
  - command: `mongod`
  - arguments: `--version`
  - installed regex: `version v(.*)`
  - latest URL: `https://www.mongodb.com/try/download/community`
  - latest regex: `(\d+.\d+.\d+) \(current\)`

- [Notepad++](https://notepad-plus-plus.org/)

  - type: `Static`
  - shell: `powershell`
  - command: `Get-ItemProperty`
  - arguments: `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion`
  - installed regex: `Notepad\+\+ \(64\-bit x64\)\s+(\S+)\s+`
  - latest URL: `https://notepad-plus-plus.org/downloads/`
  - latest regex: `<strong>Current Version (.*)<\/strong>`

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
