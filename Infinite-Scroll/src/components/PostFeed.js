import React, { useEffect, useState, useRef, useCallback } from 'react';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles.css'; // Importing CSS for styling

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchPosts = useCallback(async () => {
    if (loading) return; // Prevent multiple fetches
    setLoading(true);
    console.log('Fetching posts...');

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${page}`);
      const data = await response.json();

      // Stop fetching more if there's no more data
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [page, loading]);

  useEffect(() => {
    if (hasMore) {
      fetchPosts();
    }
  }, [fetchPosts, hasMore]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log('Last element in view, loading more...');
          setPage((prevPage) => prevPage + 1); // Fetch the next page
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="post-feed">
      <h2 className="post-feed-title">Latest Blog Posts</h2>
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post.id}>
              <PostCard
                title={post.title}
                body={post.body}
                userId={post.userId}
              />
            </div>
          );
        } else {
          return (
            <PostCard
              key={post.id}
              title={post.title}
              body={post.body}
              userId={post.userId}
            />
          );
        }
      })}
      {loading && <LoadingSpinner />}
      {!hasMore && <div className="end-of-feed">No more posts to load.</div>}
    </div>
  );
};

export default PostFeed;
