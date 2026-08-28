// // import axios from 'axios';
// // import baseUrl from '../../cosntants.js';
// // console.log("1",baseUrl);

// // const axiosInstance = axios.create();

// // axiosInstance.defaults.baseURL = baseUrl;
// // axiosInstance.defaults.withCredentials = true;

// // export default axiosInstance;

// import axios from 'axios';
// import baseUrl from '../../Cosntants.js';
// import * as Keychain from 'react-native-keychain';

// const axiosInstance = axios.create({
//   baseURL: baseUrl,
//   timeout: 60000,
//   headers: {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   },
//   withCredentials: true,
// });

// axiosInstance.interceptors.request.use(async config => {

//   const credentials = await Keychain.getGenericPassword();

//   if (credentials) {
//     const {accessToken} = JSON.parse(credentials.password);

//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }

//   return config;
// });

// axiosInstance.interceptors.request.use(
//   config => {
//     console.log('Making request to:', config.baseURL + config.url);
//     return config;
//   },
//   error => {
//     console.error('Request error:', error);
//     return Promise.reject(error);
//   },
// );

// axiosInstance.interceptors.response.use(
//   response => {
//     console.log('Response received:', response);
//     return response;
//   },
//   error => {
//     console.error('Response error:', error.response || error.message);
//     return Promise.reject(error);
//   },
// );

// export default axiosInstance;

import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import baseUrl from '../../Cosntants.js';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async config => {
    const credentials = await Keychain.getGenericPassword();

    if (credentials) {
      const {accessToken} = JSON.parse(credentials.password);

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const credentials = await Keychain.getGenericPassword();

        if (!credentials) {
          throw new Error('No credentials');
        }

        const {refreshToken} = JSON.parse(credentials.password);

        const response = await axios.post(`${baseUrl}/user/refreshToken`, {
          refreshToken,
        });

        const newAccessToken = response.data.data.accessToken;

        await Keychain.setGenericPassword(
          'token',
          JSON.stringify({
            accessToken: newAccessToken,
            refreshToken,
          }),
        );

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err);

        // await Keychain.resetGenericPassword();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

axiosInstance.interceptors.request.use(
  config => {
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => {
    console.log('Response received:', response);
    return response;
  },
  error => {
    console.error('Response error:', error.response || error.message);
    return Promise.reject(error);
  },
);
export default axiosInstance;
