using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Storage.AccessCache;

namespace SoftwareUpdateChecker
{
    internal static class FileUtil
    {
        private static StorageFolder appFolder = ApplicationData.Current.LocalFolder;

        public static async Task SaveArrayToFileAsJson(object json, string fileName)
        {
            StorageFile file = await appFolder.CreateFileAsync(fileName, CreationCollisionOption.ReplaceExisting);
            await FileIO.WriteTextAsync(file, JsonConvert.SerializeObject(json, Formatting.Indented));
        }

        public static async Task<List<T>> ReadJsonArrayFromFile<T>(string fileName)
        {
            StorageFile file = await appFolder.GetFileAsync(fileName);
            return JsonConvert.DeserializeObject<List<T>>(await FileIO.ReadTextAsync(file));
        }

        public static string SaveDirectoryAsToken(StorageFolder file)
        {
            string token = Guid.NewGuid().ToString();
            StorageApplicationPermissions.FutureAccessList.AddOrReplace(token, file);
            return token;
        }

        public static async Task<StorageFolder> GetDirectoryFromToken(string token)
        {
            if (!StorageApplicationPermissions.FutureAccessList.ContainsItem(token))
            {
                return null;
            }
            return await StorageApplicationPermissions.FutureAccessList.GetFolderAsync(token);
        }
    }
}