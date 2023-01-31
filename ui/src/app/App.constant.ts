/*eslint-disable no-restricted-globals*/
const url = `${location.origin}${location.pathname}`;

const API_PATH = process.env.REACT_APP_API_PATH || "/";
const APP_PATH = url || process.env.REACT_APP_PATH || "http://localhost:3000";

export { API_PATH, APP_PATH };
