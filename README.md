# OCR-Strava

A web application that analyzes Strava activity screenshots and extracts structured data from them using OCR technology.

## Demo Video

[![OCR-Strava Demo Video](https://img.youtube.com/vi/TGQaCj_Gg8E/0.jpg)](https://www.youtube.com/watch?v=TGQaCj_Gg8E "OCR-Strava Demo Video")

## Features

- Upload multiple Strava screenshots for different users
- Process images with Tesseract.js OCR to extract activity data
- Extract information such as:
  - Activity name
  - Distance
  - Pace
  - Moving time
  - Date
  - Location
  - Achievements
  - Elevation gain
  - Calories
  - Heart rate
- View results in an organized table format
- Store data locally for future reference

## Technology Stack

- Next.js
- TypeScript
- Tesseract.js (for OCR image processing)
- Bootstrap 5
- Sharp (for image optimization)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/OCR-Strava.git
cd OCR-Strava
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a user ID in the form
2. Select multiple Strava screenshot images to upload
3. Submit the form to upload the images
4. Click "Process Images" to analyze the screenshots with OCR
5. View the extracted data in the table below

## License

This project is licensed under the ISC License - see the LICENSE file for details.