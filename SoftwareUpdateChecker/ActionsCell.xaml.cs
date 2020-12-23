using System;
using System.Threading.Tasks;
using Windows.UI;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;

// The User Control item template is documented at https://go.microsoft.com/fwlink/?LinkId=234236

namespace SoftwareUpdateChecker
{
    public sealed partial class ActionsCell : UserControl
    {
        public int Row { get; private set; }

        public ActionsCell(int row)
        {
            this.Row = row;
            this.InitializeComponent();
        }

        public async void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            await Refresh();
        }

        public ActionsCell SetRow(int row)
        {
            this.Row = row;
            return this;
        }

        public async Task Refresh()
        {
            RefreshButton.IsEnabled = false;
            LoadingSpinner.IsActive = true;

            Software software = App.SoftwareList[Row - 1];

            Task installedTask = CoreWindow.GetForCurrentThread().Dispatcher.RunTaskAsync(async () =>
            {
                TextBlock installedBlock = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 1, typeof(TextBlock)) as TextBlock;
                ProgressBar installedProgress = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 1, typeof(ProgressBar)) as ProgressBar;
                installedProgress.Visibility = Visibility.Visible;
                installedBlock.Visibility = Visibility.Collapsed;

                installedBlock.Text = "";
                await software.DetermineInstalledVersion();
                bool error = software.HasInstalledError();
                installedBlock.Foreground = new SolidColorBrush(error ? Colors.Red : App.GetDefaultTextColor());
                installedBlock.Text = error ? software.InstalledError : software.InstalledVersion;

                installedProgress.Visibility = Visibility.Collapsed;
                installedBlock.Visibility = Visibility.Visible;
            });
            Task latestTask = CoreWindow.GetForCurrentThread().Dispatcher.RunTaskAsync(async () =>
            {
                TextBlock latestBlock = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 2, typeof(TextBlock)) as TextBlock;
                ProgressBar latestProgress = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 2, typeof(ProgressBar)) as ProgressBar;
                latestBlock.Visibility = Visibility.Collapsed;
                latestProgress.Visibility = Visibility.Visible;

                latestBlock.Text = "";
                await software.DetermineLatestVersion();
                bool error = software.HasLatestError();
                latestBlock.Foreground = new SolidColorBrush(error ? Colors.Red : App.GetDefaultTextColor());
                latestBlock.Text = error ? software.LatestError : software.LatestVersion;

                latestProgress.Visibility = Visibility.Collapsed;
                latestBlock.Visibility = Visibility.Visible;
            });
            await Task.WhenAll(new Task[] { installedTask, latestTask });

            if (software.UpdateAvailable())
            {
                TextBlock nameBlock = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 0, typeof(TextBlock)) as TextBlock;
                TextBlock installedBlock = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 1, typeof(TextBlock)) as TextBlock;
                TextBlock latestBlock = MainPage.GetGridCellOfType(GetSoftwareGrid(RefreshButton), Row, 2, typeof(TextBlock)) as TextBlock;
                nameBlock.Foreground = new SolidColorBrush(Colors.Green);
                installedBlock.Foreground = new SolidColorBrush(Colors.Green);
                latestBlock.Foreground = new SolidColorBrush(Colors.Green);
            }

            RefreshButton.IsEnabled = true;
            LoadingSpinner.IsActive = false;
        }

        private Grid GetSoftwareGrid(DependencyObject element)
        {
            Grid softwareGrid = null;
            while (softwareGrid == null && element != null)
            {
                if (element.GetType().Equals(typeof(Grid)))
                {
                    Grid grid = element as Grid;
                    if (grid.Name == "SoftwareGrid")
                    {
                        softwareGrid = element as Grid;
                    }
                }
                element = VisualTreeHelper.GetParent(element);
            }

            return softwareGrid;
        }

        private void EditItem_Click(object sender, RoutedEventArgs e)
        {
            Software software = App.SoftwareList[Row - 1];
            MainPage.Current.Frame.Navigate(typeof(ConfigureSoftware), software);
        }

        private async void DeleteItem_Click(object sender, RoutedEventArgs e)
        {
            Software software = App.SoftwareList[Row - 1];
            ContentDialog confirmationDialog = new ContentDialog
            {
                Title = "Delete Software",
                Content = "Are you sure you want to delete software '" + software.Name + "'?",
                PrimaryButtonText = "Yes",
                CloseButtonText = "No"
            };

            ContentDialogResult result = await confirmationDialog.ShowAsync();

            if (result == ContentDialogResult.Primary)
            {
                await MainPage.Current.RemoveSoftware(Row);
            }
        }
    }
}