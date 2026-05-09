import { io } from "socket.io-client";

// In development, the socket server is on the same host but different port if not proxied
// But since we use Vite middleware, same origin should work
const socket = io();

export default socket;
