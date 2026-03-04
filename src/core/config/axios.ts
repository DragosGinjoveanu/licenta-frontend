import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost",

  // This allows cookies to be sent back and forth
  withCredentials: true,

  // Explicitly tell Axios to look for the Laravel CSRF cookie
  // and attach it to the headers for POST requests
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
