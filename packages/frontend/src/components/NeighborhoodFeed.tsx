import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, Signer } from 'ethers';
import { useFlare } from '../hooks/useFlare';
import { HARDCODED_HUB_ADDRESS, HUB_ABI } from '../constants';
import { PostCard, Post } from './PostCard';

export const NeighborhoodFeed = () => {
  const { provider, signer, isConnected } = useFlare();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!provider) return;
      setIsLoading(true);
      setError(null);
      try {
        const hubContract = new Contract(
          HARDCODED_HUB_ADDRESS,
          HUB_ABI,
          provider
        );

        const postCount = await hubContract.posts.length;

        const fetchedPosts: Post[] = [];
        for (let i = postCount - 1; i >= 0; i--) {
          const post = await hubContract.posts(i);
          fetchedPosts.push(post);
        }
        setPosts(fetchedPosts);
      } catch (e) {
        console.error('Failed to fetch posts:', e);
        setError('Could not load posts. Is the hub contract address correct?');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [provider]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !newPostContent.trim()) return;

    setIsPosting(true);
    setError(null);
    try {
      const hubContract = new Contract(HARDCODED_HUB_ADDRESS, HUB_ABI, signer);

      const tx = await hubContract.createPost(newPostContent, false);

      await tx.wait();

      setNewPostContent('');

      window.location.reload();
    } catch (e) {
      console.error('Failed to create post:', e);
      setError('Failed to create post. Do you have permission?');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="neighborhood-feed">
      <h2>Neighborhood Feed</h2>

      {isConnected && (
        <form onSubmit={handleCreatePost} className="post-form">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind, neighbor?"
            disabled={isPosting}
          />
          <button type="submit" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Create Post'}
          </button>
        </form>
      )}

      {isLoading && <p>Loading posts...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={Number(post.id)} post={post} />
        ))}
      </div>
    </div>
  );
};
