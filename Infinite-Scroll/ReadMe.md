# Social Media Feed with Infinite Scrolling
To run locally:
```bash
npm install
```

```bash
npm start
```

### 1. **How would you implement infinite scrolling in a React component?**

Infinite scrolling is implemented using the `IntersectionObserver` API.
- The last post in the list is tracked using a `ref` (`lastPostElementRef`). When this element comes into view, the observer detects it and triggers a state change to fetch more posts.

```js
const lastPostElementRef = useCallback(
  (node) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1); // Fetch the next page
      }
    });
    if (node) observer.current.observe(node);
  },
  [loading, hasMore]
);
```

- The `fetchPosts` function is called whenever the user scrolls to the bottom of the page, effectively loading the next page of posts.
  
```js
useEffect(() => {
  if (hasMore) {
    fetchPosts();
  }
}, [fetchPosts, hasMore]);
```

### 2. **Describe how to fetch and display additional posts as the user scrolls.**

Fetching and displaying additional posts works as follows:

- **Scroll Detection**: The `IntersectionObserver` monitors the last post in the current list. When the last post becomes visible, it signals that it's time to fetch more posts.

```js
const lastPostElementRef = useCallback(
  (node) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  },
  [loading, hasMore]
);
```

- **API Call**: The `fetchPosts` function is triggered when the scroll detection event occurs. This function makes a request to the `jsonplaceholder` API with the current page number and a post limit (`_limit=10`).

```js
const fetchPosts = useCallback(async () => {
  if (loading) return; // Prevent multiple fetches
  setLoading(true);
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${page}`
    );
    const data = await response.json();
    if (data.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prevPosts) => [...prevPosts, ...data]);
    }
    setLoading(false);
  } catch (error) {
    setLoading(false);
  }
}, [page, loading]);
```

- **Appending New Posts**: After the data is fetched, the new posts are appended to the existing list.

```js
setPosts((prevPosts) => [...prevPosts, ...data]);
```

### 3. **How can you optimize the loading of posts to improve performance and user experience?**

To optimize loading and improve performance, consider these strategies:

1. **Lazy Loading**: Render only the visible posts using virtualization.

2. **Throttling or Debouncing**: Throttle or debounce the scroll event to avoid triggering too many requests.

3. **Caching Data**: Cache fetched posts in local storage or global state (e.g., Redux) to avoid unnecessary refetching.

4. **Batching Requests**: Fetch more posts at once to reduce the number of API calls.

### 4. **Explain how you would handle loading states and display a spinner while new posts are being fetched.**

The `loading` state is managed to control when the spinner is shown and hidden:

- **Before Fetching**: The `loading` state is set to `true`, which renders the `LoadingSpinner` component.

```js
{loading && <LoadingSpinner />}
```

- **After Fetching**: When posts are fetched, the `loading` state is set to `false` to hide the spinner.

```js
setLoading(false);
```

### 5. **What are the potential challenges with infinite scrolling, and how would you address them?**

**Challenges**:

1. **Performance Degradation**: As more posts are loaded, the DOM can slow down due to the growing list.

2. **Network Throttling**: Frequent API calls can overwhelm the network.

3. **Endless Fetching**: Fetching could go on indefinitely without proper termination.

```js
if (data.length === 0) {
  setHasMore(false); // Stop fetching when no more posts
}
```

4. **User Experience**: Users may get frustrated with no way to navigate back to the top.

5. **Accessibility**: Infinite scrolling can be difficult for users relying on screen readers or keyboard navigation.
