
# IOU Tracker

A simple, clean, and private money tracker to keep a log of how much you owe someone (or they owe you). Designed with a mobile-first, app-like experience in mind.

This is a Progressive Web App (PWA), which means you can "install" it to your phone's home screen for easy access, and it will work offline.

## ✨ Features

- **👤 Multi-Profile Management**: Track debts for multiple people separately.
- **💰 Multi-Currency Support**: Log transactions in USD, EUR, or GBP with automatic conversion to a base currency (USD) for consistent totals.
- **🔁 Recurring Expenses**: Set up automatic recurring transactions for things like rent or subscriptions.
- **📊 Summaries**: Get an overall summary of all your debts and credits across all profiles.
- **🔒 Privacy First**: All data is stored locally on your device in your browser's local storage. Nothing is sent to a server.
- **📲 PWA Ready**: Install the app on your mobile device for a native-app feel and offline access.
- **💾 Backup & Restore**: Easily backup all your data to a JSON file and restore it later.

## 🚀 How to Use

1.  **Create a Profile**: When you first open the app, you'll be prompted to create a profile for the person whose IOUs you want to track.
2.  **Add Transactions**:
    -   Use the input field at the bottom to enter a description and an amount.
    -   Click the **red "Owe More" button** if you owe them more.
    -   Click the **green "Paid Back" button** if you've paid them back some amount.
3.  **Switch Profiles**: Use the dropdown at the top of the screen to switch between different people.
4.  **Manage Settings**:
    -   Click the **cog icon** to open settings.
    -   Here you can manage recurring expenses, delete profiles, and backup or restore your data.

## 🔧 Built With

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
