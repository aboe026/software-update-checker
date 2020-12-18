using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Windows.UI;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace SoftwareUpdateChecker
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public static MainPage Current;
        public MainPage()
        {
            Current = this;
            this.InitializeComponent();
            this.DataContext = this;
            PopulateSoftwareGrid();
            //this.RequestedTheme = ElementTheme.Light;
        }

        private void PopulateSoftwareGrid()
        {
            foreach (Software software in App.SoftwareList)
            {
                AddSoftwareRow(software.Name, software.InstalledVersion, software.LatestVersion);
            }
        }

        public void AddSoftwareRow(string name, string installed, string latest)
        {
            int newRowIndex = SoftwareGrid.RowDefinitions.Count;
            SoftwareGrid.RowDefinitions.Add(new RowDefinition() { Height = GridLength.Auto });
            AddTextCell(name, newRowIndex, 0, false);
            AddTextCell(installed, newRowIndex, 1, true);
            AddTextCell(latest, newRowIndex, 2, true);

            ActionsCell actions = new ActionsCell(newRowIndex);
            actions.Tag = newRowIndex.ToString();
            SoftwareGrid.Children.Add(actions);
            Grid.SetRow(actions, newRowIndex);
            Grid.SetColumn(actions, 3);
        }

        private void AddTextCell(string text, int row, int column, bool progressBar)
        {
            TextBlock block = new TextBlock();
            block.TextWrapping = TextWrapping.WrapWholeWords;
            block.Text = text != null ? text : "";
            SoftwareGrid.Children.Add(block);
            Grid.SetRow(block, row);
            Grid.SetColumn(block, column);
            if (progressBar)
            {
                ProgressBar bar = new ProgressBar();
                bar.Visibility = Visibility.Collapsed;
                bar.IsIndeterminate = true;
                SoftwareGrid.Children.Add(bar);
                Grid.SetRow(bar, row);
                Grid.SetColumn(bar, column);
            }
        }

        public static FrameworkElement GetGridCellOfType(Grid grid, int row, int column, Type type)
        {
            FrameworkElement targetCell = null;
            for (int i = 0; i < grid.Children.Count && targetCell == null; i++)
            {
                FrameworkElement cell = grid.Children[i] as FrameworkElement;
                if (Grid.GetRow(cell) == row && Grid.GetColumn(cell) == column && cell.GetType() == type)
                {
                    targetCell = cell;
                }
            }
            return targetCell;
        }

        private void AddSoftwareButton_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(ConfigureSoftware));
        }

        private async void RefreshAllButton_Click(object sender, RoutedEventArgs e)
        {
            RefreshAllButton.IsEnabled = false;
            RefreshAllLoadingSpinner.IsActive = true;
            Task[] tasks = new Task[SoftwareGrid.RowDefinitions.Count - 1]; // do not include first "header" row
            for (int i = 0; i < tasks.Length; i++)
            {
                int localIndex = i; // i would get incremented for all inside the RunTaskAsync anonymous function
                tasks[localIndex] = CoreWindow.GetForCurrentThread().Dispatcher.RunTaskAsync(async () =>
                {
                    ActionsCell actions = GetGridCellOfType(SoftwareGrid, localIndex + 1, 3, typeof(ActionsCell)) as ActionsCell;
                    await actions.Refresh();
                });
            }
            await Task.WhenAll(tasks);
            RefreshAllLoadingSpinner.IsActive = false;
            RefreshAllButton.IsEnabled = true;
        }

        public async Task RemoveSoftware(int row)
        {
            SoftwareLoading.IsActive = true;
            Message.Text = "";
            try
            {
                await App.Current.RemoveSoftware(App.SoftwareList[row - 1]);
                List<FrameworkElement> cellsToRemove = new List<FrameworkElement>();
                foreach (FrameworkElement cell in SoftwareGrid.Children)
                {
                    if (Grid.GetRow(cell) == row)
                    {
                        cellsToRemove.Add(cell);
                    }
                }
                foreach (FrameworkElement cell in cellsToRemove)
                {
                    SoftwareGrid.Children.Remove(cell);
                }
                foreach (FrameworkElement cell in SoftwareGrid.Children)
                {
                    if (Grid.GetRow(cell) > row)
                    {
                        Grid.SetRow(cell, Grid.GetRow(cell) - 1);
                    }
                }
                SoftwareGrid.RowDefinitions.RemoveAt(row);
                int rowCount = SoftwareGrid.RowDefinitions.Count;
                for (int i = row; i < rowCount; i++)
                {
                    ActionsCell actions = GetGridCellOfType(SoftwareGrid, i, 3, typeof(ActionsCell)) as ActionsCell;
                    actions.SetRow(actions.Row - 1);
                }
            } 
            catch (Exception ex)
            {
                Message.Foreground = new SolidColorBrush(Colors.Red);
                Message.Text = ex.Message;
            }
            SoftwareLoading.IsActive = false;
        }
    }
}
