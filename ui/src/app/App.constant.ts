/*eslint-disable no-restricted-globals*/
const url = `${location.origin}`;
const APP_ORIGIN = url;

const API_PATH = process.env.REACT_APP_API_PATH || "/";
const APP_PATH = url || process.env.REACT_APP_PATH || "http://localhost:3000";
const PREVIEW_REQUEST_HEADER = "X-CAS-Preview";

export { API_PATH, APP_PATH, APP_ORIGIN, PREVIEW_REQUEST_HEADER };
