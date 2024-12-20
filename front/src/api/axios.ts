import axios, {AxiosInstance} from "axios";

export const Api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    withCredentials: true,
});
