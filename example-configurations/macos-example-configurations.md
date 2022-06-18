- [Chrome](https://www.google.com/chrome/)

  - type: `Static`
  - command: `system_profiler`
  - arguments: `SPApplicationsDataType | grep Chrome -A 2`
  - installed regex: `Version: (.*)`
  - latest URL: `https://www.softpedia.com/get/Internet/Browsers/Google-Chrome.shtml`
  - latest regex: `Download Google Chrome ([^\s]+) `

- [Firefox](https://www.mozilla.org/)

  - type: `Static`
  - command: `system_profiler`
  - arguments: `SPApplicationsDataType | grep Firefox -A 5`
  - installed regex: `Version: (.*)`
  - latest URL: `https://www.mozilla.org/en-US/firefox/releases/`
  - latest regex: `data-latest-firefox="(\S+)"`

- [PowerShell](https://github.com/PowerShell/PowerShell)

  - type: `Static`
  - command: `pwsh`
  - argument: `--version`
  - installed regex: `PowerShell (.*)`
  - latest URL: `https://github.com/PowerShell/PowerShell/releases/latest`
  - latest regex: `releases\/tag\/v(.*?)&quot;`

- [VS Code](https://code.visualstudio.com/)

  - type: `Static`
  - command: `system_profiler`
  - argument: `SPApplicationsDataType | grep 'Visual Studio Code' -A 2`
  - installed regex: `Version: (.*)`
  - latest URL: `https://github.com/microsoft/vscode/releases/latest`
  - latest regex: `releases\/tag\/(.*?)&quot;`