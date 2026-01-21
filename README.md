# GrammarGuard Chrome Extension

GrammarGuard is a lightweight, open-source browser extension that checks for grammar and spelling errors in text fields. It highlights mistakes and provides suggestions using the LanguageTool API.

## Video Link: 
```  https://drive.google.com/file/d/18gwF5AUH5qyET9lrRcpSOkRG3XAFjdmJ/view?usp=sharing          ```


## 🚀 Features
- **Real-time Detection:** Monitors text input in `<textarea>` and `<input>` fields.
- **Privacy Focused:** Only sends text to the API when you stop typing (debounced).
- **Clean UI:** Simple red border and tooltip suggestions.
- **Lightweight:** Built with Manifest V3.

---

## 🛠️ How to Install

Since this is a developer version, you will install it manually using Chrome's "Load Unpacked" feature.

1. **Download the Source Code:**
   - Clone this repository or download the ZIP folder.
   - Ensure the folder `GrammarGuard-Chrome-Extension` contains `manifest.json`.

2. **Open Chrome Extensions:**
   - Open Google Chrome.
   - Type `chrome://extensions` in the address bar and hit Enter.

3. **Enable Developer Mode:**
   - In the top right corner of the page, toggle the switch for **Developer Mode** to ON.

4. **Load the Extension:**
   - Click the **Load unpacked** button (top left).
   - Select the `GrammarGuard-Chrome-Extension` folder from your computer.

5. **Test It:**
   - Open any website with a text area (or create a simple HTML test file).
   - Type a sentence with errors (e.g., *"He go to school yesterday"*).
   - Look for the ⚠️ warning icon or red border.

---

## 🧠 How It Works

1. **Event Listener:** The `content.js` script adds an event listener to the active tab. It watches for user input on text fields.
2. **Debouncing:** To prevent spamming the API, the extension waits for the user to stop typing for 1 second before triggering a check.
3. **API Call:** The text is sent to the **LanguageTool API** (an open-source grammar engine).
4. **Visual Feedback:** - If errors are found, the extension injects a red border CSS style onto the input element.
   - A custom Tooltip DOM element is generated to display the correction suggestions returned by the API.

---

