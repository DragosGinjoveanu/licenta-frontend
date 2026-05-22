import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

window.Pusher = Pusher;

const echoAxios = axios.create({
  baseURL: "http://localhost",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

window.Echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],

  authorizer: (channel: any) => {
    return {
      authorize: (socketId: string, callback: Function) => {
        echoAxios
          .post("/api/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            console.error("Echo Auth failed:", error);
            callback(true, error);
          });
      },
    };
  },
});
