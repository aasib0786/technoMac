import axios from 'axios';

// const serverURL = 'http://localhost:8000/api';
const serverURL = 'https://api.technomacmedical.com/api';

const getToken = () => {
  const admin = JSON.parse(sessionStorage.getItem('Admin'));

  return admin?.token;
};

const postData = async (url, body) => {
  try {
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

const getData = async (url) => {
  try {
    const response = await axios.get(`${serverURL}/${url}`);

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const patchData = async (url, body) => {
  try {
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

export { serverURL, postData, getData, patchData, deleteData, getToken, updateFaq };
