import { useState } from 'react'
import './App.css'

function App() {
  const languageCodes = {
    French: 'fr',
    Spanish: 'es',
    Japanese: 'ja',
  }
  const [textInput, setTextInput] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('French')
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleTranslate = async () => {
    setErrorMessage('')
    if (!textInput.trim()) {
      setErrorMessage('Please type some text first!')
      return
    }

    const target = languageCodes[selectedLanguage]
    if (!target) {
      setErrorMessage('Selected language is not supported.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(textInput) + '&langpair=en|' + target
      )
      if (!response.ok) {
        throw new Error(`Translation API request failed with status ${response.status}`)
      }

      const data = await response.json()
      const translation = data?.responseData?.translatedText?.trim()
      if (!translation) {
        throw new Error('Invalid response from the translation service.')
      }

      setChatHistory([
        { type: 'user', label: 'Original Text', content: textInput },
        {
          type: 'ai',
          label: `Your Translation (${selectedLanguage})`,
          content: translation,
        },
      ])
      setShowResults(true)
    } catch (error) {
      console.error(error)
      const message = error?.message || 'Unknown translation error'
      setErrorMessage(`Translation error: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = () => {
    setTextInput('')
    setChatHistory([])
    setErrorMessage('')
    setShowResults(false)
  }

  return (
    <div className="app-container">
      <div className="brand-title">POLLYGLOT</div>
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      {!showResults ? (
        <div id="input-view">
          <label className="section-label">Text to translate</label>
          <textarea
            placeholder="Type something here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          <label className="section-label">Select language</label>
          <div className="lang-selector">
            <label className="lang-option">
              French
              <input
                type="radio"
                name="lang"
                checked={selectedLanguage === 'French'}
                onChange={() => setSelectedLanguage('French')}
              />
            </label>
            <label className="lang-option">
              Spanish
              <input
                type="radio"
                name="lang"
                checked={selectedLanguage === 'Spanish'}
                onChange={() => setSelectedLanguage('Spanish')}
              />
            </label>
            <label className="lang-option">
              Japanese
              <input
                type="radio"
                name="lang"
                checked={selectedLanguage === 'Japanese'}
                onChange={() => setSelectedLanguage('Japanese')}
              />
            </label>
          </div>

          <button onClick={handleTranslate} disabled={isLoading}>
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      ) : (
        <div id="results-view">
          <label className="section-label">Conversation history</label>
          <div className="chat-view">
            {chatHistory.map((bubble, index) => (
              <div
                key={index}
                className={`chat-bubble ${bubble.type === 'user' ? 'bubble-user' : 'bubble-ai'}`}
              >
                <span className="bubble-meta">{bubble.label}</span>
                {bubble.content}
              </div>
            ))}
          </div>

          <button onClick={() => setShowResults(false)}>Translate Another</button>
          <button onClick={handleStartOver} className="secondary-btn">
            Start Over
          </button>
        </div>
      )}
    </div>
  )
}

export default App
