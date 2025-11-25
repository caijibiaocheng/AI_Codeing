import React, { useState } from 'react';
import './HTTPClient.css';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type TabType = 'headers' | 'body';

interface Header {
  key: string;
  value: string;
}

interface HTTPClientProps {
  onClose: () => void;
}

const HTTPClient: React.FC<HTTPClientProps> = ({ onClose }) => {
  const [method, setMethod] = useState<HTTPMethod>('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('headers');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      // Build headers object
      const headersObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim()) {
          headersObj[h.key] = h.value;
        }
      });

      // Build fetch options
      const options: RequestInit = {
        method,
        headers: headersObj
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      // Make request
      const res = await fetch(url, options);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Get response body
      const contentType = res.headers.get('content-type');
      let responseBody;
      
      if (contentType && contentType.includes('application/json')) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration
      });
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'redirect';
    return 'error';
  };

  const formatResponseBody = (body: any) => {
    if (typeof body === 'object') {
      return JSON.stringify(body, null, 2);
    }
    return body;
  };

  return (
    <div className="http-client-panel">
      <div className="http-client-header">
        <h3>HTTP Client</h3>
        <button className="todo-btn" onClick={onClose}>Close</button>
      </div>

      <div className="http-client-content">
        {/* Request Section */}
        <div className="http-request-section">
          <h4>Request</h4>
          
          <div className="http-url-bar">
            <select
              className="http-method-select"
              value={method}
              onChange={(e) => setMethod(e.target.value as HTTPMethod)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
            
            <input
              type="text"
              className="http-url-input"
              placeholder="Enter request URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
            />
            
            <button
              className="http-send-btn"
              onClick={sendRequest}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="http-tabs">
            <button
              className={`http-tab ${activeTab === 'headers' ? 'active' : ''}`}
              onClick={() => setActiveTab('headers')}
            >
              Headers
            </button>
            <button
              className={`http-tab ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => setActiveTab('body')}
            >
              Body
            </button>
          </div>

          {activeTab === 'headers' && (
            <div className="http-headers-editor">
              {headers.map((header, index) => (
                <div key={index} className="http-header-row">
                  <input
                    type="text"
                    className="http-header-input"
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="http-header-input"
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  />
                  <button
                    className="http-header-remove"
                    onClick={() => removeHeader(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button className="http-add-header-btn" onClick={addHeader}>
                + Add Header
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <textarea
              className="http-body-editor"
              placeholder="Request body (JSON, XML, plain text, etc.)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
            />
          )}
        </div>

        {/* Response Section */}
        {(response || error || loading) && (
          <div className="http-response-section">
            <div className="http-response-header">
              <h4>Response</h4>
              {response && (
                <div className="http-response-status">
                  <span className={`http-status-code ${getStatusClass(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="http-response-time">{response.duration}ms</span>
                </div>
              )}
            </div>

            {loading && (
              <div className="http-loading">Sending request...</div>
            )}

            {error && (
              <div className="http-error">{error}</div>
            )}

            {response && (
              <>
                <div className="http-tabs">
                  <button className="http-tab active">Body</button>
                  <button className="http-tab">Headers</button>
                </div>
                <div className="http-response-body">
                  <pre>{formatResponseBody(response.body)}</pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HTTPClient;
