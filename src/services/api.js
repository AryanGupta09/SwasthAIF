import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL
});

export default API;
