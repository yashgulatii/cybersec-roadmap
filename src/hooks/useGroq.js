// src/hooks/useGroq.js
import { useState } from 'react';

export function useGroq() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWithTimeout = async (url, options, timeoutMs = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const callGroq = async (systemPrompt, userMessage) => {
    setIsLoading(true);
    setError('');
    setResponse('');

    const workerUrl = import.meta.env.VITE_WORKER_URL;

    try {
      if (!workerUrl) {
        throw new Error('VITE_WORKER_URL environment variable is not defined.');
      }

      let responseObj;
      let attemptModel = "llama3-8b-8192";

      try {
        responseObj = await fetchWithTimeout(workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: attemptModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ]
          })
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          const timeoutMsg = "SIGNAL LOST — WORKER TIMEOUT";
          setError(timeoutMsg);
          setIsLoading(false);
          throw new Error(timeoutMsg);
        }
        throw err;
      }

      if (responseObj.status === 500) {
        attemptModel = "mixtral-8x7b-32768";
        try {
          responseObj = await fetchWithTimeout(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: attemptModel,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
              ]
            })
          });
        } catch (err) {
          if (err.name === 'AbortError') {
            const timeoutMsg = "SIGNAL LOST — WORKER TIMEOUT";
            setError(timeoutMsg);
            setIsLoading(false);
            throw new Error(timeoutMsg);
          }
          throw err;
        }
      }

      if (!responseObj.ok) {
        const statusCode = responseObj.status;
        const responseText = await responseObj.text();
        let formattedMsg = `[!] WORKER ERROR // Status: ${statusCode} // ${responseText}`;
        
        if (statusCode === 429) {
          formattedMsg = "RATE LIMITED — TRY AGAIN IN 30s";
        }
        
        setError(formattedMsg);
        setIsLoading(false);
        throw new Error(formattedMsg);
      }

      let data;
      try {
        data = await responseObj.json();
      } catch (err) {
        const parseErr = "PARSE ERROR — INVALID RESPONSE";
        setError(parseErr);
        setIsLoading(false);
        throw new Error(parseErr);
      }

      if (data.error) {
        const responseText = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        let formattedMsg = `[!] WORKER ERROR // Status: ${responseObj.status} // ${responseText}`;
        setError(formattedMsg);
        setIsLoading(false);
        throw new Error(formattedMsg);
      }

      const resultText = data.result || 'No response returned from AI.';
      setResponse(resultText);
      setIsLoading(false);
      return resultText;
    } catch (err) {
      console.error('Worker query failure:', err);
      let errMsg = err.message || 'unknown anomaly';
      if (err.name === 'AbortError' || errMsg.includes('TIMEOUT')) {
        errMsg = "SIGNAL LOST — WORKER TIMEOUT";
      } else if (errMsg.includes('JSON')) {
        errMsg = "PARSE ERROR — INVALID RESPONSE";
      }
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg);
    }
  };

  return { response, isLoading, error, callGroq };
}
