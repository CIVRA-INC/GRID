export interface Post {
  id: bigint;
  author: string;
  content: string;
  timestamp: bigint;
  isAnonymous: boolean;
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const authorDisplay = post.isAnonymous ? 'Anonymous Member' : post.author;
  const formattedDate = new Date(
    Number(post.timestamp) * 1000
  ).toLocaleString();

  return (
    <div className="post-card">
      <p className="post-content">{post.content}</p>
      <div className="post-meta">
        <span>By: {authorDisplay}</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};
