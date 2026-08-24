import axios from 'axios';

// const serverURL = 'http://localhost:8000/api';
const serverURL = 'https://api.technomacmedical.com/api';

// In-memory cache & in-flight request deduplication
const apiCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

const getToken = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const admin = JSON.parse(sessionStorage.getItem('Admin'));
    return admin?.token;
  } catch {
    return undefined;
  }
};

const clearApiCache = () => {
  apiCache.clear();
};

const postData = async (url, body) => {
  try {
    clearApiCache();
    const response = await axios.post(`${serverURL}/${url}`, body, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getData = async (url, options = {}) => {
  const { bypassCache = false, ttl = DEFAULT_TTL_MS } = options;
  const fullUrl = `${serverURL}/${url}`;

  if (!bypassCache && apiCache.has(fullUrl)) {
    const cached = apiCache.get(fullUrl);
    if (Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    apiCache.delete(fullUrl);
  }

  if (!bypassCache && inFlightRequests.has(fullUrl)) {
    return inFlightRequests.get(fullUrl);
  }

  const fetchPromise = (async () => {
    try {
      const response = await axios.get(fullUrl);
      const data = response.data;

      if (data) {
        apiCache.set(fullUrl, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      inFlightRequests.delete(fullUrl);
    }
  })();

  if (!bypassCache) {
    inFlightRequests.set(fullUrl, fetchPromise);
  }

  return fetchPromise;
};

const patchData = async (url, body) => {
  try {
    clearApiCache();
    const response = await axios.put(`${serverURL}/${url}`, body, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// FAQsManagement.jsx mein — import ke neeche add karo
const updateFaq = async (url, body) => {
  try {
    clearApiCache();
    const response = await axios.put(`${serverURL}/${url}`, body, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json', // ✅ JSON
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const deleteData = async (url) => {
  try {
    clearApiCache();
    const response = await axios.delete(`${serverURL}/${url}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export { serverURL, postData, getData, patchData, deleteData, getToken, updateFaq, clearApiCache };

