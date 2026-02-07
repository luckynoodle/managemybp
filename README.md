# Blood Pressure Tracker

A mobile-friendly web application for tracking and managing blood pressure readings. Record multiple readings, view averages, and maintain your health history with automatic data retention.

## Features

- **Batch Entry**: Record up to 10 blood pressure readings per session
- **Automatic Averaging**: Calculates average systolic, diastolic, and pulse values
- **Local Storage**: All data stored securely on your device
- **14-Day Retention**: Automatic cleanup of readings older than 2 weeks
- **Mobile Optimized**: Responsive design for iOS and Android devices
- **Offline Capable**: Works without internet connection
- **Dark Mode**: Automatic dark mode support based on system preferences

## How to Use

### Adding a Reading

1. Enter your systolic pressure (70-200 mmHg)
2. Enter your diastolic pressure (40-130 mmHg)
3. Optionally enter your pulse rate (40-200 bpm)
4. Click "Add Reading"

### Recording a Session

- Add multiple readings (up to 10) for more accurate averages
- Review your current readings before saving
- Click "Save Session" to store with calculated averages
- Use "Clear" to start over if needed

### Viewing History

- All saved sessions appear in the History section
- Sessions are ordered newest first
- Click any session to expand and view individual readings
- Delete sessions you no longer need

## Data Management

- **Storage**: All data is stored locally in your browser's localStorage
- **Privacy**: No data is sent to any server
- **Retention**: Readings older than 14 days are automatically deleted
- **Backup**: Data is device-specific; export functionality not included

## Technical Details

### Technologies Used

- Pure HTML5, CSS3, and JavaScript (no frameworks)
- LocalStorage API for data persistence
- Responsive CSS with mobile-first design
- CSS Grid and Flexbox for layouts

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
python -m http.server 8000

# Using Node.js
npx serve
```

Then visit `http://localhost:8000`

## File Structure

```
managemybp/
├── index.html      # Main HTML structure
├── styles.css      # Responsive styling
├── app.js          # Application logic
└── README.md       # Documentation
```

## License

This project is free to use and modify for personal use.

## Contributing

Feel free to fork and customize for your needs. Suggestions and improvements are welcome!

## Disclaimer

This app is for personal tracking purposes only and should not replace professional medical advice. Always consult with healthcare professionals regarding your blood pressure readings.
