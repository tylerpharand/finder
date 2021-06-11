var sheet = document.createElement('style')
sheet.innerHTML = `
  .finder-highlight {
    transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
    background: #ffeb00 !important;
    border-radius: 0.2em !important;
    color: black !important;
  }

  .finder-highlight:focus {
    color: black !important;
    background: #ffeb00 !important;
    background-color: #ffeb00 !important;
    outline: none !important;
    box-shadow: 0 0 0 2pt #bbab38 !important;
  }

  #finder-helper {
    box-shadow: rgba(0,0,0,0.15) 0px 3px 10px;
    font-weight: 500;
    font-size: 1.5em;
    font-family: Arial, Helvetica, sans-serif;
    opacity: 0;
    visibility: hidden;
    border: 1px solid rgba(0,0,0,10%);
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: saturate(100%) blur(10px) brightness(2);
    color: rgba(0, 0, 0, 0.8);
    text-shadow: rgb(255 255 255 / 50%) 0px 0.5px 1px;
    position: fixed;
    z-index: 10000000;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 1em;
    padding: 0.8em 1em;
    transition: opacity 0.15s ease-in-out, visibility 0.15s ease-in-out;
  }
`;
document.body.appendChild(sheet);

const debounce = (callback, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      timeoutId = null
      callback(...args)
    }, delay)
  }
}

class Finder {
  constructor() {
    this.HOTKEY = 'Control'
    this.KEY_IGNORE_LIST = ['Meta', 'Shift', 'Clear']
    this.FOCUSABLE_ELEMENTS_QUERY = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    this.DEBOUNCE_DELAY_MS = 250
    this.query = ''
    this.highlightedElements = []
    this.highlight = debounce(() => this._highlight(), this.DEBOUNCE_DELAY_MS)
    this.tabIndex = 0

    this.initialize()
  }

  initialize() {
    this.registerHandlers()
    this.injectHelper()
  }

  injectHelper() {
    const helper = document.createElement('div');
    helper.id = 'finder-helper'
    document.body.appendChild(helper);
    this.helper = helper
    this.render()
  }

  registerHandlers() {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' || (event.key === 'Backspace' && !event.ctrlKey)) {
        this.clearQuery()
        this.render()
        return
      }
      if (event.key === 'Tab' && this.highlightedElements.length > 0) {
        event.preventDefault()
        if (event.shiftKey) {
          this.focusNext(event)
        } else {
          this.focusPrevious(event)
        }
        return
      }
      if (event.ctrlKey) {
        if (event.key === this.HOTKEY) {
          this.clearQuery()
        } else if (event.key === 'Backspace') {
          this.query = this.query.slice(0, -1)
        } else if (!this.KEY_IGNORE_LIST.includes(event.key)) {
          this.query += event.key
        }

        if (this.query.length > 0) {
          this.highlight()
        } else {
          this.clearQuery()
        }

        this.render()
        return
      }
    })
  }

  _highlight() {
    this.clearHighlights()

    if (this.query) {
      this.highlightedElements = [...document.querySelectorAll(this.FOCUSABLE_ELEMENTS_QUERY)]
        .filter(e => (
          e.innerText.trim() &&
          e.innerText.trim()
            .toLowerCase()
            .includes(this.query)
        ))

      this.highlightedElements.forEach(e => e.classList.add('finder-highlight'))
      this.initialFocus()
    }
  }

  clearQuery() {
    this.clearHighlights()
    this.query = ''
  }

  clearHighlights() {
    this.highlightedElements.forEach(e => {
      e.classList.remove('finder-highlight')
      e.classList.remove('finder-focus')
    })
    this.highlightedElements = []
  }

  initialFocus() {
    this.highlightedElements[0]?.focus()
    this.tabIndex = 0
  }

  focusNext() {
    if (this.tabIndex - 1 < 0) {
      this.tabIndex = this.highlightedElements.length - 1
    } else {
      this.tabIndex -= 1
    }
    this.highlightedElements[this.tabIndex]?.focus()
  }

  focusPrevious() {
    if (this.tabIndex >= this.highlightedElements.length - 1) {
      this.tabIndex = 0
    } else {
      this.tabIndex += 1
    }
    this.highlightedElements[this.tabIndex]?.focus()
  }

  render() {
    if (this.query) {
      this.helper.innerText = this.query
      this.helper.style.opacity = 1
      this.helper.style.visibility = 'visible'
    } else {
      this.helper.style.opacity = 0
      this.helper.style.visibility = 'hidden'
    }
  }
}

const finder = new Finder()
