# To Run locally
~ npm install

~ npm run dev


Here's the information in **Markdown** format:

---

### 1. How would you set up a real-time WebSocket connection in a React component for collaborative editing?

To set up a real-time WebSocket connection, use `useEffect` to initialize the connection. For example:

```jsx
useEffect(() => {
  const socket = io("ws://your-server.com");
  socket.on("event", (data) => {
    // Handle event data
  });
  return () => socket.disconnect(); // Clean up
}, []);
```

This connects to a WebSocket server, listens for incoming messages, and disconnects on component unmount.

---

### 2. Describe how to implement drawing functionality on an HTML5 canvas using React.

In React, `useRef` to interact with the `<canvas>` element. Handle mouse events like `onMouseDown`, `onMouseMove`, and `onMouseUp` to capture user drawing input. For instance:

```jsx
const canvasRef = useRef(null);
const handleMouseMove = (e) => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
};
```

I have also added drawing tools like pencil, line, and shapes based on `tool` state.

---

### 3. How can you synchronize the state of the canvas across multiple users in real-time?

Synchronize the canvas state across multiple users using WebSocket. Emit drawing data (e.g., strokes, lines) to the server:

```jsx
socket.emit("drawing", { line: [x, y], color });
```

On receiving data from the server, update the canvas for other users:

```jsx
socket.on("drawing", (data) => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.strokeStyle = data.color;
  ctx.lineTo(data.line[0], data.line[1]);
  ctx.stroke();
});
```

This way, all users' canvases stay in sync.

---

### 4. Explain how you would handle and display the list of active users.

To manage and display active users, maintain a list in state:

```jsx
const [users, setUsers] = useState([]);
```

Update it via WebSocket events when users connect or disconnect:

```jsx
socket.on("users", (updatedUsers) => {
  setUsers(updatedUsers);
});
```

Display the list dynamically:

```jsx
<ul>{users.map((user) => <li key={user.id}>{user.name}</li>)}</ul>
```

---

### 5. What measures would you take to ensure the scalability and performance of the real-time collaborative whiteboard?

To ensure scalability and performance:
- **Debounce mouse events**: Reduce WebSocket messages by throttling/delaying drawing updates.
- **Optimize canvas data**: Send minimal data (e.g., strokes/coordinates) instead of large images.
- **Distributed architecture**: Use WebSocket load balancing to distribute connections across multiple servers.
- **Compression**: Compress canvas data where possible (e.g., reduce image resolution).
- **Use CDN**: Offload static assets to a CDN to reduce server load.

--- 

