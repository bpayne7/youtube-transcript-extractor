# YouTube Transcript Extractor & ChatGPT Integration 📋🤖

This Chrome extension extracts the transcript from YouTube videos, removes timestamps, copies the cleaned transcript to the clipboard, and opens a ChatGPT page to automatically paste and submit the transcript for summarization.

---

## Features 🚀
- **Extracts transcripts** from YouTube videos.
- **Removes timestamps** for a cleaner text output.
- **Copies the transcript to the clipboard** for easy use.
- **Automates ChatGPT interaction** by opening a specific project page, pasting the transcript, and submitting it automatically.

---

## How It Works ⚙️
1. **YouTube Transcript Extraction:**
   - The extension runs when the icon is clicked on a YouTube video page.
   - It clicks the "Show transcript" button and extracts text from the transcript panel.
   - Timestamps are filtered out, leaving only the transcript text.
   - The cleaned transcript is copied to the clipboard.

2. **ChatGPT Automation:**
   - After extracting the transcript, the extension opens a predefined ChatGPT page in a new tab.
   - It waits for the page to load, pastes the transcript into the input area, and submits it automatically. 

  ***NOTE I copy it into a chatGPT project with custom instructions on how to summarize the content

---

## Installation 🔧
1. **Clone or download** this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable **Developer mode** (top-right corner).
4. Click **Load Unpacked** and select the folder containing this extension.
5. The extension icon will appear in your toolbar.

---

## Usage 📖
1. Open a **YouTube video** with a transcript available.
2. Click the **extension icon**.
3. The transcript will be extracted and copied to your clipboard.
4. The extension will open a **ChatGPT page** and paste the transcript automatically.
5. The transcript is submitted to ChatGPT for summarization or further processing.


