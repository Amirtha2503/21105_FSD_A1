import React from 'react';

const PostCard = ({ title, body, userId }) => {
  return (
    <div className="post-card">
      <div className="post-header">
        <h3 className="post-title">{title}</h3>
        <p className="post-user">By User {userId}</p>
      </div>
      <p className="post-body">{body}</p>
      <button className="read-more-button">Read More</button>
    </div>
  );
};

export default PostCard;
