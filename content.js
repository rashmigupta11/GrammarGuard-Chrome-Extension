let debounceTimer;
const API_URL = "https://api.languagetool.org/v2/check";

// Check if enabled
chrome.storage.local.get(['enabled'], (result) => {
  if (result.enabled !== false) {
    initGrammarChecker();
  }
});

function initGrammarChecker() {
  document.addEventListener('input', (e) => {
    const target = e.target;
    // Only check textarea or simple inputs
    if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.type === 'text')) {
      clearTimeout(debounceTimer);
      // Wait 1 second after typing stops to call API (Debounce)
      debounceTimer = setTimeout(() => checkGrammar(target), 1000);
    }
  });
}

async function checkGrammar(element) {
  const text = element.value;
  if (!text || text.length < 5) return;

  // Prepare parameters for LanguageTool API
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("language", "en-US");
  params.append("enabledOnly", "false");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: params
    });

    const data = await response.json();
    if (data.matches && data.matches.length > 0) {
      showVisualFeedback(element, data.matches);
    } else {
        removeVisualFeedback(element);
    }
  } catch (error) {
    console.error("Grammar Check Error:", error);
  }
}

// ---------------------------------------------------------
// UI Visualization Logic
// NOTE: Perfect overlay on textarea is complex. 
// We will use a simplified "Status Icon" approach for stability.
// ---------------------------------------------------------

let currentTooltip = null;

function showVisualFeedback(inputElement, matches) {
    // Remove existing feedback wrapper if any
    let wrapper = inputElement.parentElement;
    if (!wrapper.classList.contains('grammar-guard-wrapper')) {
        // Wrap the input to position our elements relative to it
        wrapper = document.createElement('div');
        wrapper.className = 'grammar-guard-wrapper';
        inputElement.parentNode.insertBefore(wrapper, inputElement);
        wrapper.appendChild(inputElement);
    }

    // Remove old indicators
    const oldIcon = wrapper.querySelector('.grammar-status-icon');
    if (oldIcon) oldIcon.remove();

    // Add a simple warning icon in the corner of the input
    const icon = document.createElement('div');
    icon.className = 'grammar-status-icon';
    icon.innerHTML = '⚠️';
    icon.title = `${matches.length} issues found. Click to see.`;
    icon.style.cssText = `
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
        z-index: 10;
        font-size: 16px;
    `;
    
    // On click, show the first error popup
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        createTooltip(inputElement, matches);
    });

    wrapper.appendChild(icon);
    inputElement.style.border = "2px solid #e74c3c"; // Red border for error
}

function removeVisualFeedback(inputElement) {
    inputElement.style.border = "";
    if (inputElement.parentElement.classList.contains('grammar-guard-wrapper')) {
        const icon = inputElement.parentElement.querySelector('.grammar-status-icon');
        if (icon) icon.remove();
    }
}

function createTooltip(inputElement, matches) {
    if (currentTooltip) currentTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'grammar-tooltip';

    // Position tooltip near the input
    const rect = inputElement.getBoundingClientRect();
    tooltip.style.left = `${window.scrollX + rect.left}px`;
    tooltip.style.top = `${window.scrollY + rect.bottom + 5}px`;

    // Limit to top 3 errors to keep UI clean
    const errorsToShow = matches.slice(0, 3);
    
    errorsToShow.forEach(match => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="label">${match.message}</div>
            ${match.replacements.slice(0, 3).map(rep => 
                `<span class="suggestion" data-val="${rep.value}" data-offset="${match.offset}" data-len="${match.length}">${rep.value}</span>`
            ).join('')}
        `;
        tooltip.appendChild(div);
    });

    // Handle correction click
    tooltip.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            const replacement = e.target.getAttribute('data-val');
            const offset = parseInt(e.target.getAttribute('data-offset'));
            const len = parseInt(e.target.getAttribute('data-len'));
            
            applyCorrection(inputElement, replacement, offset, len);
            tooltip.remove();
        }
    });

    document.body.appendChild(tooltip);
    currentTooltip = tooltip;

    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', closeTooltip, { once: true });
    }, 100);
}

function closeTooltip(e) {
    if (currentTooltip && !currentTooltip.contains(e.target)) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

function applyCorrection(inputElement, replacement, offset, length) {
    const originalText = inputElement.value;
    const newText = originalText.substring(0, offset) + replacement + originalText.substring(offset + length);
    inputElement.value = newText;
    
    // Trigger input event to update frameworks (like React/Angular) if present
    const event = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(event);
    
    // Remove red border if fixed (simplified logic)
    inputElement.style.border = "";
    if (inputElement.parentElement.classList.contains('grammar-guard-wrapper')) {
        const icon = inputElement.parentElement.querySelector('.grammar-status-icon');
        if (icon) icon.remove();
    }
}