# GPT-Scan-Strava

A web application that uses OpenAI's GPT-4o Vision to analyze Strava activity screenshots and extract structured data from them.

## Demo

[![GPT-Scan-Strava Demo](https://img.youtube.com/vi/PM-hJJwad5I/0.jpg)](https://youtu.be/PM-hJJwad5I?si=Fm_-h6uuMM3yyAqN)

## Features

- Upload multiple Strava screenshots for different users
- Process images with GPT-4o Vision to extract activity data
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
- OpenAI API (GPT-4o Vision)
- Bootstrap 5
- Sharp (for image processing)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/GPT-Scan-Strava.git
cd GPT-Scan-Strava
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a user ID in the form
2. Select multiple Strava screenshot images to upload
3. Submit the form to upload the images
4. Click "Process Images" to analyze the screenshots
5. View the extracted data in the table below

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the GPT-4o Vision API
- [Next.js](https://nextjs.org/) for the React framework
- [Bootstrap](https://getbootstrap.com/) for UI components