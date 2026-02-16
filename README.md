# Blood Pressure Tracker

A mobile-friendly web application for tracking and managing blood pressure readings. Record multiple readings, view averages, analyze trends with graphs, and maintain your health history with automatic data retention.

## Features

- **Multi-Page Design**: Separate pages for recording readings and viewing history
- **Batch Entry**: Record up to 10 blood pressure readings per session
- **Session Notes**: Add notes to each session (up to 500 characters) with auto-expanding textarea
- **Automatic Averaging**: Calculates average systolic, diastolic, and pulse values
- **Trend Graph**: Visual chart showing blood pressure trends over time (Canvas-based)
- **Date Filtering**: Filter history by last 7 days, 14 days, 30 days, or custom date range
- **Data Export**: Export all readings to a formatted text file
- **Local Storage**: All data stored securely on your device
- **30-Day Retention**: Automatic cleanup of readings older than 1 month
- **Session Management**: Delete individual sessions or clear all data at once
- **Compact UI**: Space-efficient design fits more information on screen
- **Mobile Optimized**: Responsive, touch-friendly design for iOS and Android devices
- **Offline Capable**: Works without internet connection
- **Dark Mode**: Automatic dark mode support based on system preferences

## How to Use

### Navigation

The app has two pages accessible via the tab navigation bar:
- **New Reading**: Record blood pressure readings
- **History**: View trends, filter by date, and manage saved sessions

### Adding a Reading

1. Enter your systolic pressure (70-200 mmHg)
2. Enter your diastolic pressure (40-130 mmHg)
3. Optionally enter your pulse rate (40-200 bpm)
4. Click "Add Reading"

### Recording a Session

- Add multiple readings (up to 10) for more accurate averages
- Review your current readings before saving
- Optionally add notes about the session (time of day, medication, symptoms, etc.)
- Notes field auto-expands as you type (up to 500 characters)
- Click "Save Session" to store with calculated averages and notes
- Use "Clear" to start over if needed

### Viewing History & Trends

- Navigate to the **History** tab to view all saved sessions
- **Filter by date range**: Choose Last 7 days, Last 14 days, Last 30 days, or Custom
- **Trend graph**: Shows systolic (red), diastolic (blue), and pulse (green) lines over time
- Click any session to expand and view individual readings, notes, and delete option
- Sessions with notes show a "Has notes" indicator

### Managing Your Data

- **Export Data**: Click "Export" to download all sessions as a text file
  - Includes all readings, averages, dates, and notes
  - File named with current date (e.g., `bp-readings-2026-02-14.txt`)
  - Exports all data regardless of current filter
- **Delete Individual Session**: Expand a session and click "Delete Session"
- **Clear All Data**: Click "Clear All" to remove all sessions (with confirmation)

## Data Management

- **Storage**: All data is stored locally in your browser's localStorage
- **Privacy**: No data is sent to any server - everything stays on your device
- **Retention**: Readings older than 30 days are automatically deleted on app load
- **Export**: Download all your data as a text file for backup or sharing
- **Device-Specific**: Data is stored per device/browser - export to transfer between devices

## UI Features

- **Tab Navigation**: Clean tab bar to switch between New Reading and History pages
- **Compact Layout**: Space-efficient design maximizes screen real estate
- **Side-by-Side Inputs**: Systolic and diastolic fields displayed horizontally
- **Auto-Expanding Notes**: Textarea grows automatically as you type
- **Character Counter**: Live count shows remaining characters for notes (500 max)
- **Trend Graph**: Canvas-based chart with auto-scaling axes and responsive layout
- **Date Range Filters**: Quick filter buttons with custom date range picker
- **Touch-Friendly**: All buttons and inputs sized for easy mobile interaction (44px minimum)
- **Visual Feedback**: Color-coded buttons, graph lines, and hover effects
- **Expandable History**: Click to expand sessions and view details

## Technical Details

### Technologies Used

- Pure HTML5, CSS3, and JavaScript (no frameworks or dependencies)
- Canvas API for trend graph rendering (HiDPI/retina support)
- LocalStorage API for data persistence
- Responsive CSS with mobile-first design
- CSS Grid and Flexbox for layouts
- Blob API for file download/export functionality
- Native HTML5 date inputs for custom date range

### Browser Compatibility

- Chrome (Android/Desktop)
- Safari (iOS/macOS)
- Firefox
- Edge
- Any modern browser with localStorage support

## Deployment to GitHub Pages

### Initial Setup

1. **Create a new repository** on GitHub
2. **Clone the repository** locally:
   ```bash
   git clone https://github.com/yourusername/managemybp.git
   cd managemybp
   ```

3. **Add your files** to the repository:
   ```bash
   git add .
   git commit -m "Initial commit: Blood pressure tracker app"
   git push origin main
   ```

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **main** branch
5. Select **/ (root)** as the folder
6. Click **Save**

### Access Your App
After a few minutes, your app will be available at:
```
https://yourusername.github.io/managemybp/
```

### Updating the App

To deploy updates:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically update within a few minutes.

## Local Development

To test locally, simply open `index.html` in your web browser. No build process or server required.

For better testing experience with HTTPS (required for some features):
```bash
# Using Python 3
python -m http.server 8100

# Using Node.js
npx serve
```

Then visit `http://localhost:8100`

## File Structure

```
managemybp/
├── index.html      # Main page - new reading entry
├── history.html    # History page - trends, filtering, session list
├── styles.css      # Shared responsive styling
├── storage.js      # Shared localStorage data module
├── app.js          # Main page logic
├── history.js      # History page logic (filtering, graph, display)
└── README.md       # Documentation
```

## License

This project is free to use and modify for personal use.

## Contributing

Feel free to fork and customize for your needs. Suggestions and improvements are welcome!

## Disclaimer

This app is for personal tracking purposes only and should not replace professional medical advice. Always consult with healthcare professionals regarding your blood pressure readings.
