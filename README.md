# LeetCode Counter

A simple Chrome extension that shows your LeetCode activity stats in a beautiful popup UI.

## Features

- Fetches LeetCode profile data by username
- Shows today's solved count
- Displays current streak
- Shows total active days
- Shows active years
- Renders a recent submission activity calendar
- Modern gradient UI with loading and error states

## Project Structure

- `manifest.json` - Extension manifest
- `popup.html` - Popup layout
- `popup.css` - Popup styling
- `popup.js` - LeetCode API fetch logic and stats calculations

## How It Works

The extension calls LeetCode's GraphQL endpoint and reads the user's `submissionCalendar` data. From that data, it calculates:

- today's solved problems
- streak
- total active days
- active years
- recent activity grid

## Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

## Usage

1. Open the extension popup
2. Enter a valid LeetCode username
3. Click **Fetch Stats**
4. View the activity summary

## Notes

- The username must be a public LeetCode profile
- If there is no activity data, the popup will show an error message
- The current query in `popup.js` is kept minimal and unchanged

## License

This project is for personal use and learning.
