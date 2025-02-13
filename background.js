// When the extension icon is clicked...
chrome.action.onClicked.addListener(async (tab) => {
  // Ensure we are on a YouTube video page.
  if (!tab.url.includes("youtube.com/watch")) {
    alert("This extension works only on YouTube video pages.");
    return;
  }

  try {
    // Inject the function below into the current YouTube tab to extract the transcript.
    let [{ result: transcriptText }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractTranscriptFromYouTube,
    });

    if (!transcriptText) {
      console.error("No transcript was extracted.");
      return;
    }
    console.log("Transcript extracted:", transcriptText);

    // Open the ChatGPT page in a new tab.
    chrome.tabs.create(
      { url: "https://chatgpt.com/g/g-p-677d61bf69c881918e28b745d2e8dcca-youtube-summary/project/" },
      (newTab) => {
        // Wait for the new tab to finish loading.
        chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
          if (updatedTabId === newTab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            // Inject the function below into the ChatGPT page to paste the transcript and send it.
            chrome.scripting.executeScript({
              target: { tabId: newTab.id },
              func: pasteTranscriptToChatGPT,
              args: [transcriptText],
            });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error during execution:", error);
  }
});

/**
 * This function runs in the context of the YouTube page.
 * It clicks the necessary buttons, waits for the transcript to load,
 * extracts the transcript text (filtering out lines that are timestamps),
 * and copies the text to the clipboard.
 */
async function extractTranscriptFromYouTube() {
  // Helper: wait for an element matching a selector to appear in the DOM.
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;
      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(el);
        } else {
          elapsed += interval;
          if (elapsed >= timeout) {
            reject(new Error("Element " + selector + " not found"));
          } else {
            setTimeout(check, interval);
          }
        }
      };
      check();
    });
  }

  // Click the "more" button to expand the description (if available).
  try {
    const moreButton = await waitForElement("tp-yt-paper-button#expand");
    moreButton.click();
  } catch (e) {
    console.warn("More button not found or already expanded:", e);
  }

  // Click the "Show transcript" button.
  try {
    const transcriptButton = await waitForElement('button[aria-label="Show transcript"]');
    transcriptButton.click();
  } catch (e) {
    console.error("Show transcript button not found:", e);
    return "";
  }

  // Wait until transcript lines appear.
  let transcriptElements = [];
  try {
    await new Promise((resolve, reject) => {
      const checkTranscript = () => {
        const elements = document.querySelectorAll("yt-formatted-string.segment-text.style-scope.ytd-transcript-segment-renderer");
        if (elements.length > 0) {
          transcriptElements = Array.from(elements);
          resolve();
        } else {
          setTimeout(checkTranscript, 200);
        }
      };
      checkTranscript();
    });
  } catch (e) {
    console.error("Transcript lines not found:", e);
    return "";
  }

  // Extract text from each transcript element.
  // Filter out any text that exactly matches a timestamp pattern (e.g., "0:00" or "00:00:00").
  const transcriptText = transcriptElements
    .map(el => el.innerText)
    .filter(text => !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(text.trim()))
    .join(" ");

  // Copy the transcript text to the clipboard.
  try {
    await navigator.clipboard.writeText(transcriptText);
    console.log("Transcript copied to clipboard.");
  } catch (e) {
    console.error("Failed to copy transcript to clipboard:", e);
  }

  return transcriptText;
}

function pasteTranscriptToChatGPT(transcriptText) {
  // Helper: wait for an element matching a selector to appear.
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;
      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          console.log("Found element:", selector, el);
          resolve(el);
        } else {
          elapsed += interval;
          if (elapsed >= timeout) {
            reject(new Error("Element " + selector + " not found"));
          } else {
            setTimeout(check, interval);
          }
        }
      };
      check();
    });
  }

  // Wait for the ChatGPT "new chat" input area.
  waitForElement('p[data-placeholder="New chat in this project"]')
    .then(inputArea => {
      console.log("Input area found:", inputArea);
      // Focus the input area.
      inputArea.focus();
      // Update the text. Sometimes using textContent is more effective than innerText.
      inputArea.textContent = transcriptText;
      // Dispatch an input event to notify any listeners of the change.
      inputArea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Optional: wait a little for the input to be processed.
      return new Promise(resolve => setTimeout(resolve, 500));
    })
    .then(() => {
      // Now wait for the send button.
      return waitForElement('[data-testid="send-button"]');
    })
    .then(sendButton => {
      console.log("Send button found:", sendButton);
      // --- Option 1: Dispatch a synthetic mouse event ---
      sendButton.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
    })
    .catch(e => {
      console.error("Error in ChatGPT automation:", e);
    });
}
