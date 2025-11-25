import React, { useState, useEffect } from 'react';
import './RegexTester.css';

interface RegexTesterProps {
  onClose: () => void;
}

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

const QUICK_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { name: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b' },
  { name: 'Phone', pattern: '\\+?[1-9]\\d{1,14}' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'Time (HH:MM)', pattern: '([01]?[0-9]|2[0-3]):[0-5][0-9]' },
  { name: 'Hex Color', pattern: '#[0-9a-fA-F]{6}' },
  { name: 'Username', pattern: '@[a-zA-Z0-9_]{3,}' },
];

const RegexTester: React.FC<RegexTesterProps> = ({ onClose }) => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    g: true,  // global
    i: false, // case insensitive
    m: false, // multiline
    s: false, // dotall
    u: false, // unicode
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState('');

  useEffect(() => {
    testRegex();
  }, [pattern, testString, flags]);

  const testRegex = () => {
    setError(null);
    setMatches([]);
    setHighlightedText(testString);

    if (!pattern || !testString) {
      return;
    }

    try {
      const flagsStr = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');

      const regex = new RegExp(pattern, flagsStr);
      const matchResults: MatchResult[] = [];
      let lastIndex = 0;
      let highlightedHtml = '';

      if (flags.g) {
        // Global flag: find all matches
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matchResults.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });

          // Build highlighted text
          highlightedHtml += escapeHtml(testString.slice(lastIndex, match.index));
          highlightedHtml += `<span class="regex-match-highlight">${escapeHtml(match[0])}</span>`;
          lastIndex = regex.lastIndex;

          // Prevent infinite loop on zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
        highlightedHtml += escapeHtml(testString.slice(lastIndex));
      } else {
        // No global flag: find first match only
        const match = regex.exec(testString);
        if (match) {
          matchResults.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });

          highlightedHtml = escapeHtml(testString.slice(0, match.index)) +
            `<span class="regex-match-highlight">${escapeHtml(match[0])}</span>` +
            escapeHtml(testString.slice(match.index + match[0].length));
        }
      }

      setMatches(matchResults);
      setHighlightedText(highlightedHtml || escapeHtml(testString));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const toggleFlag = (flag: keyof typeof flags) => {
    setFlags({ ...flags, [flag]: !flags[flag] });
  };

  const useQuickPattern = (quickPattern: string) => {
    setPattern(quickPattern);
  };

  return (
    <div className="regex-tester-panel">
      <div className="regex-tester-header">
        <h3>Regular Expression Tester</h3>
        <button className="todo-btn" onClick={onClose}>Close</button>
      </div>

      <div className="regex-tester-content">
        {/* Pattern Input */}
        <div className="regex-input-section">
          <h4>Regular Expression</h4>
          <input
            type="text"
            className={`regex-pattern-input ${error ? 'error' : ''}`}
            placeholder="Enter your regex pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          />
          <div className="regex-flags">
            <label className="regex-flag">
              <input
                type="checkbox"
                checked={flags.g}
                onChange={() => toggleFlag('g')}
              />
              Global (g)
            </label>
            <label className="regex-flag">
              <input
                type="checkbox"
                checked={flags.i}
                onChange={() => toggleFlag('i')}
              />
              Case Insensitive (i)
            </label>
            <label className="regex-flag">
              <input
                type="checkbox"
                checked={flags.m}
                onChange={() => toggleFlag('m')}
              />
              Multiline (m)
            </label>
            <label className="regex-flag">
              <input
                type="checkbox"
                checked={flags.s}
                onChange={() => toggleFlag('s')}
              />
              Dotall (s)
            </label>
            <label className="regex-flag">
              <input
                type="checkbox"
                checked={flags.u}
                onChange={() => toggleFlag('u')}
              />
              Unicode (u)
            </label>
          </div>

          <div className="regex-quick-patterns">
            <h5>Quick Patterns</h5>
            <div className="regex-quick-pattern-list">
              {QUICK_PATTERNS.map((qp, index) => (
                <button
                  key={index}
                  className="regex-quick-pattern"
                  onClick={() => useQuickPattern(qp.pattern)}
                >
                  {qp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test String Input */}
        <div className="regex-input-section">
          <h4>Test String</h4>
          <textarea
            className="regex-test-input"
            placeholder="Enter text to test against the regex"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="regex-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {!error && pattern && testString && (
          <div className="regex-results">
            <h4>Results</h4>
            
            <div className="regex-match-info">
              <div className={`regex-match-count ${matches.length > 0 ? 'has-matches' : 'no-matches'}`}>
                {matches.length > 0 
                  ? `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}`
                  : 'No matches found'}
              </div>
            </div>

            {matches.length > 0 && (
              <>
                <div
                  className="regex-highlighted-text"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />

                <div className="regex-matches-list">
                  {matches.map((match, index) => (
                    <div key={index} className="regex-match-item">
                      <div className="regex-match-item-header">
                        <span className="regex-match-index">Match {index + 1}</span>
                        <span>at index {match.index}</span>
                      </div>
                      <div className="regex-match-text">{match.match}</div>
                      {match.groups.length > 0 && (
                        <div className="regex-groups">
                          {match.groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="regex-group">
                              <span className="regex-group-label">Group {groupIndex + 1}:</span>
                              <span className="regex-group-value">{group || '(empty)'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegexTester;
