using System;
using Windows.ApplicationModel.Core;
using Windows.Storage;
using Windows.Storage.Pickers;
using Windows.UI;
using Windows.UI.Core;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=234238

namespace SoftwareUpdateChecker
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class ConfigureSoftware : Page
    {
        private StorageFolder executableFolder;
        private Software existingSoftware;
        public static UISettings uiSettings = new UISettings();

        public ConfigureSoftware()
        {
            uiSettings.ColorValuesChanged += ColorValuesChanged;
            this.InitializeComponent();
        }

        protected async override void OnNavigatedTo(NavigationEventArgs e)
        {
            if (e != null && e.Parameter != null && e.Parameter.GetType().Equals(typeof(Software)))
            {
                Title.Text = "Edit Software";
                existingSoftware = (Software)e.Parameter;
                SoftwareName.Text = existingSoftware.Name;
                switch (existingSoftware.ExecutableType)
                {
                    case ExecutableType.Dynamic:
                        ExecutablePivot.SelectedIndex = 2;
                        if (existingSoftware.ExecutableIdentifier != null)
                        {
                            executableFolder = await FileUtil.GetDirectoryFromToken(existingSoftware.ExecutableIdentifier);
                            DynamicFolderPath.Text = executableFolder.Path;
                        }
                        if (existingSoftware.ExecutableRegex != null)
                        {
                            DynamicFolderFilter.Text = existingSoftware.ExecutableRegex;
                        }
                        break;

                    case ExecutableType.Fixed:
                        ExecutablePivot.SelectedIndex = 1;
                        if (existingSoftware.ExecutableIdentifier != null)
                        {
                            FixedFilePath.Text = existingSoftware.ExecutableIdentifier;
                        }
                        break;

                    default:
                        ExecutablePivot.SelectedIndex = 0;
                        if (existingSoftware.ExecutableIdentifier != null)
                        {
                            CommandName.Text = existingSoftware.ExecutableIdentifier;
                        }
                        break;
                }
                if (existingSoftware.InstalledArguments != null)
                {
                    Arguments.Text = existingSoftware.InstalledArguments;
                }
                if (existingSoftware.InstalledRegex != null)
                {
                    InstallRegex.Text = existingSoftware.InstalledRegex;
                }
                if (existingSoftware.LatestRegex != null)
                {
                    LatestRegex.Text = existingSoftware.LatestRegex;
                }
                if (existingSoftware.LatestUrl != null)
                {
                    LatestUrl.Text = existingSoftware.LatestUrl;
                }
            }
            base.OnNavigatedTo(e);
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            if (this.Frame.CanGoBack)
            {
                this.Frame.GoBack();
            }
        }

        private async void ChooseFixedFileButton_Click(object sender, RoutedEventArgs e)
        {
            FileOpenPicker filePicker = new FileOpenPicker
            {
                ViewMode = PickerViewMode.List,
                SuggestedStartLocation = PickerLocationId.ComputerFolder
            };
            filePicker.FileTypeFilter.Add(".exe");
            StorageFile file = await filePicker.PickSingleFileAsync();
            if (file != null)
            {
                FixedFilePath.Text = file.Path;
            }
        }

        private async void ChooseDynamicFolderButton_Click(object sender, RoutedEventArgs e)
        {
            FolderPicker folderPicker = new FolderPicker
            {
                ViewMode = PickerViewMode.List,
                SuggestedStartLocation = PickerLocationId.ComputerFolder
            };
            folderPicker.FileTypeFilter.Add("*");
            StorageFolder folder = await folderPicker.PickSingleFolderAsync();
            if (folder != null)
            {
                executableFolder = folder;
                DynamicFolderPath.Text = executableFolder.Path;
            }
        }

        private Software GetSoftwareFromInputs()
        {
            ExecutableType type = ExecutableType.Command;
            string executable = "";
            switch (ExecutablePivot.SelectedIndex)
            {
                case 0:
                    type = ExecutableType.Command;
                    executable = CommandName.Text;
                    break;

                case 1:
                    type = ExecutableType.Fixed;
                    executable = FixedFilePath.Text;
                    break;

                case 2:
                    type = ExecutableType.Dynamic;
                    if (executableFolder != null)
                    {
                        executable = FileUtil.SaveDirectoryAsToken(executableFolder);
                    }
                    break;
            }
            return new Software(SoftwareName.Text, type, executable, DynamicFolderFilter.Text, Arguments.Text, InstallRegex.Text, LatestUrl.Text, LatestRegex.Text);
        }

        private async void DynamicFolderTestButton_Click(object sender, RoutedEventArgs e)
        {
            SetDynamicFolderEnabled(false);
            DynamicFolderTestProgress.Visibility = Visibility.Visible;
            DynamicFolderTestMessage.Text = "";
            DynamicFolderTestMessage.Foreground = new SolidColorBrush(App.GetDefaultTextColor());
            try
            {
                if (executableFolder == null)
                {
                    throw new Exception("Must specify executable folder above");
                }
                if (DynamicFolderFilter.Text == "")
                {
                    throw new Exception("Must specify executable file regex above");
                }
                StorageFile executable = await Software.GetFolderFileByRegex(executableFolder, DynamicFolderFilter.Text);
                if (executable == null)
                {
                    throw new Exception("No file found matching regex pattern");
                }
                DynamicFolderTestMessage.Text = "Matching file found: '" + executable.Name + "'";
            }
            catch (Exception ex)
            {
                DynamicFolderTestMessage.Foreground = new SolidColorBrush(Colors.Red);
                DynamicFolderTestMessage.Text = ex.Message;
            }
            finally
            {
                DynamicFolderTestProgress.Visibility = Visibility.Collapsed;
                SetDynamicFolderEnabled(true);
            }
        }

        private void SetDynamicFolderEnabled(bool enabled)
        {
            ChooseDynamicFolderButton.IsEnabled = enabled;
            DynamicFolderFilter.IsEnabled = enabled;
            DynamicFolderTestButton.IsEnabled = enabled;
        }

        private async void InstallTestButton_Click(object sender, RoutedEventArgs e)
        {
            SetInstallEnabled(false);
            InstallTestProgress.Visibility = Visibility.Visible;
            InstallTestMessage.Text = "";
            InstallTestMessage.Foreground = new SolidColorBrush(App.GetDefaultTextColor());
            try
            {
                Software software = GetSoftwareFromInputs();
                await software.DetermineInstalledVersion();
                if (software.HasInstalledError())
                {
                    throw new Exception(software.InstalledError);
                }
                InstallTestMessage.Text = "Installed Version: '" + software.InstalledVersion + "'";
            }
            catch (Exception ex)
            {
                InstallTestMessage.Foreground = new SolidColorBrush(Colors.Red);
                InstallTestMessage.Text = ex.Message;
            }
            finally
            {
                InstallTestProgress.Visibility = Visibility.Collapsed;
                SetInstallEnabled(true);
            }
        }

        private void SetInstallEnabled(bool enabled)
        {
            ExecutablePivot.IsEnabled = enabled;
            ChooseFixedFileButton.IsEnabled = enabled;
            ChooseDynamicFolderButton.IsEnabled = enabled;
            DynamicFolderFilter.IsEnabled = enabled;
            DynamicFolderTestButton.IsEnabled = enabled;
            Arguments.IsEnabled = enabled;
            InstallRegex.IsEnabled = enabled;
            InstallTestButton.IsEnabled = enabled;
        }

        private async void LatestTestButton_Click(object sender, RoutedEventArgs e)
        {
            SetLatestEnabled(false);
            LatestTestProgress.Visibility = Visibility.Visible;
            LatestTestMessage.Text = "";
            LatestTestMessage.Foreground = new SolidColorBrush(App.GetDefaultTextColor());
            try
            {
                Software software = GetSoftwareFromInputs();
                await software.DetermineLatestVersion();
                if (software.HasLatestError())
                {
                    throw new Exception(software.LatestError);
                }
                LatestTestMessage.Text = "Latest Version: '" + software.LatestVersion + "'";
            }
            catch (Exception ex)
            {
                LatestTestMessage.Foreground = new SolidColorBrush(Colors.Red);
                LatestTestMessage.Text = ex.Message;
            }
            finally
            {
                LatestTestProgress.Visibility = Visibility.Collapsed;
                SetLatestEnabled(true);
            }
        }

        private void SetLatestEnabled(bool enabled)
        {
            LatestUrl.IsEnabled = enabled;
            LatestRegex.IsEnabled = enabled;
            LatestTestButton.IsEnabled = enabled;
        }

        private async void Save_Click(object sender, RoutedEventArgs e)
        {
            SetSaveEnabled(false);
            SaveProgress.IsActive = true;
            SaveError.Text = "";

            SetLatestEnabled(false);
            SetInstallEnabled(false);
            SoftwareName.IsEnabled = false;

            bool success = false;
            try
            {
                if (SoftwareName.Text == "")
                {
                    throw new Exception("Must specify name above");
                }
                Software software = GetSoftwareFromInputs();
                await software.DetermineInstalledVersion();
                if (software.HasInstalledError())
                {
                    throw new Exception("Could not determine installed version, test above to troubleshoot");
                }
                await software.DetermineLatestVersion();
                if (software.HasLatestError())
                {
                    throw new Exception("Could not determine latest software, test above to troubleshoot");
                }
                if (existingSoftware == null)
                {
                    await App.Current.AddSoftware(software);
                }
                else
                {
                    await App.Current.EditSoftware(existingSoftware, software);
                }
                success = true;
            }
            catch (Exception ex)
            {
                SaveError.Text = ex.Message;
            }
            finally
            {
                if (success)
                {
                    this.Frame.Navigate(typeof(MainPage));
                }
                else
                {
                    SoftwareName.IsEnabled = true;
                    SetInstallEnabled(true);
                    SetLatestEnabled(true);
                    SaveProgress.IsActive = false;
                    SetSaveEnabled(true);
                }
            }
        }

        private void SetSaveEnabled(bool enabled)
        {
            Save.IsEnabled = enabled;
            Cancel.IsEnabled = enabled;
        }

        private async void ColorValuesChanged(UISettings sender, object args)
        {
            Color backgroundColor = sender.GetColorValue(UIColorType.Background);
            bool isDarkMode = backgroundColor == Colors.Black;
            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                App.Current.SetTextBlockColor(DynamicFolderTestMessage);
                App.Current.SetTextBlockColor(InstallTestMessage);
                App.Current.SetTextBlockColor(LatestTestMessage);
            });
        }
    }
}