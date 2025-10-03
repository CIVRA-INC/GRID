import React from 'react';
import useAppStore from '../store/appStore';

const CreatePostForm = () => {
  // Get state and actions directly from the global store
  const { createPostForm, updateCreatePostForm, resetCreatePostForm, setLoading, setError } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate an API call to a smart contract or backend
      console.log('Submitting post:', createPostForm);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // throw new Error("Simulated network failure!"); // Uncomment to test error case

      console.log('Post submitted successfully!');
      resetCreatePostForm(); // Clear the form on success
    } catch (err) {
      setError('Failed to submit post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      <h3>Create a New Post</h3>
      <textarea
        placeholder="What's on your mind?"
        value={createPostForm.content}
        onChange={(e) => updateCreatePostForm('content', e.target.value)}
        style={{ width: '100%', minHeight: '80px' }}
        disabled={useAppStore.getState().isLoading}
      />
      <div style={{ margin: '1rem 0' }}>
        <label>
          <input
            type="checkbox"
            checked={createPostForm.isAnonymous}
            onChange={(e) => updateCreatePostForm('isAnonymous', e.target.checked)}
            disabled={useAppStore.getState().isLoading}
          />
          Post Anonymously
        </label>
      </div>
      <button type="submit" disabled={useAppStore.getState().isLoading}>
        {useAppStore.getState().isLoading ? 'Submitting...' : 'Submit Post'}
      </button>
    </form>
  );
};

export default CreatePostForm;