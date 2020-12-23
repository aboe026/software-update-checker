using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Windows.Storage;

namespace SoftwareUpdateChecker
{
    public enum ExecutableType
    {
        Command,
        Fixed,
        Dynamic
    }

    public class Software
    {
        public string Name { get; private set; }
        public ExecutableType ExecutableType { get; private set; }
        public string ExecutableIdentifier { get; private set; }
        public string ExecutableRegex { get; private set; }
        public string InstalledArguments { get; private set; }
        public string InstalledRegex { get; private set; }
        public string LatestUrl { get; private set; }
        public string LatestRegex { get; private set; }
        public string InstalledError { get; private set; }
        public string LatestError { get; private set; }
        public string InstalledVersion { get; private set; }
        public string LatestVersion { get; private set; }

        public Software(string name, ExecutableType executableType, string executableIdentifier, string executableRegex, string installedArguments, string installedRegex, string latestUrl, string latestRegex)
        {
            this.Name = name;
            this.ExecutableType = executableType;
            this.ExecutableIdentifier = executableIdentifier;
            this.ExecutableRegex = executableRegex;
            this.InstalledArguments = installedArguments;
            this.InstalledRegex = installedRegex;
            this.LatestUrl = latestUrl;
            this.LatestRegex = latestRegex;
        }

        public Software Edit(string name, ExecutableType executableType, string executableIdentifier, string executableRegex, string installedArguments, string installedRegex, string latestUrl, string latestRegex)
        {
            this.Name = name;
            this.ExecutableType = executableType;
            this.ExecutableIdentifier = executableIdentifier;
            this.ExecutableRegex = executableRegex;
            this.InstalledArguments = installedArguments;
            this.InstalledRegex = installedRegex;
            this.LatestUrl = latestUrl;
            this.LatestRegex = latestRegex;
            return this;
        }

        private async Task<string> GetExecutable()
        {
            if (ExecutableType != ExecutableType.Dynamic)
            {
                return ExecutableIdentifier;
            }
            StorageFolder folder = await FileUtil.GetDirectoryFromToken(ExecutableIdentifier);
            if (folder == null)
            {
                throw new Exception("Must specify executable folder");
            }
            StorageFile file = await GetFolderFileByRegex(folder, ExecutableRegex);
            if (file == null)
            {
                throw new Exception("Cannot find executable file matching regex");
            }
            return file.Path;
        }

        public static async Task<StorageFile> GetFolderFileByRegex(StorageFolder folder, string regex)
        {
            StorageFile executable = null;
            IReadOnlyList<StorageFile> files = await folder.GetFilesAsync();
            for (int i = 0; i < files.Count && executable == null; i++)
            {
                StorageFile file = files[i];
                Match match = Regex.Match(file.Name, regex);
                if (match.Success)
                {
                    executable = file;
                }
            }
            return executable;
        }

        public async Task<string> DetermineInstalledVersion()
        {
            try
            {
                InstalledVersion = null;
                InstalledError = null;
                if (ExecutableIdentifier == null || ExecutableIdentifier == "")
                {
                    throw new Exception("Installed Executable not specified");
                }
                if (InstalledRegex == null || InstalledRegex == "")
                {
                    throw new Exception("Installed Regex not specified");
                }
                string output = await RunCmdAsync(await GetExecutable(), InstalledArguments);
                MatchCollection matches = new Regex(InstalledRegex).Matches(output);
                if (matches.Count < 1)
                {
                    throw new Exception("Could not find RegEx match in output: \"" + output + "\"");
                }
                InstalledVersion = matches[0].Groups[1].Value.Trim();
            }
            catch (Exception ex)
            {
                InstalledError = ex.Message;
            }
            return InstalledVersion;
        }

        public async Task<string> DetermineLatestVersion()
        {
            try
            {
                LatestVersion = null;
                LatestError = null;
                if (LatestUrl == null || LatestUrl == "")
                {
                    throw new Exception("Latest URL not specified");
                }
                if (LatestRegex == null || LatestRegex == "")
                {
                    throw new Exception("Latest Regex not specified");
                }
                HttpClient http = new HttpClient();
                HttpResponseMessage response = await http.GetAsync(LatestUrl);
                string webpage = await response.Content.ReadAsStringAsync();
                MatchCollection matches = new Regex(LatestRegex).Matches(webpage);
                if (matches.Count < 1)
                {
                    throw new Exception("Could not find RegEx match in webpage: \"" + webpage + "\"");
                }
                LatestVersion = matches[0].Groups[1].Value.Trim();
            }
            catch (Exception ex)
            {
                LatestError = ex.Message;
            }
            return LatestVersion;
        }

        public bool HasInstalledError()
        {
            return InstalledError != null && InstalledError != "";
        }

        public bool HasLatestError()
        {
            return LatestError != null && LatestError != "";
        }

        public bool UpdateAvailable()
        {
            return (InstalledError == null || InstalledError == "") &&
                   (LatestError == null || LatestError == "") &&
                   (InstalledVersion != null && InstalledVersion != "") &&
                   (LatestVersion != null && LatestVersion != "") &&
                   InstalledVersion != LatestVersion;
        }

        public static Task<string> RunCmdAsync(string executable, string arguments)
        {
            var tcs = new TaskCompletionSource<string>();
            var process = new Process
            {
                StartInfo = {
                    FileName = executable,
                    Arguments = arguments,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                },
                EnableRaisingEvents = true
            };

            process.Exited += (sender, args) =>
            {
                string error = process.StandardError.ReadToEnd();
                string output = process.StandardOutput.ReadToEnd();
                if (error != "")
                {
                    tcs.SetException(new Exception(error));
                }
                else
                {
                    tcs.SetResult(output);
                }
                process.Dispose();
            };

            process.Start();

            return tcs.Task;
        }
    }
}