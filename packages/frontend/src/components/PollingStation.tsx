import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useFlare } from '../hooks/useFlare';
import { HARDCODED_HUB_ADDRESS, HUB_ABI } from '../constants';
import { PollCard, Poll } from './PollCard';

export const PollingStation = () => {
  const { provider, signer, isConnected } = useFlare();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [duration, setDuration] = useState('86400');
  const [isCreating, setIsCreating] = useState(false);

  const fetchPolls = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const hubContract = new Contract(
        HARDCODED_HUB_ADDRESS,
        HUB_ABI,
        provider
      );
      const pollCount = await hubContract.polls.length;
      const fetchedPolls: Poll[] = [];
      for (let i = 0; i < pollCount; i++) {
        const pollData = await hubContract.polls(i);
        fetchedPolls.push(pollData);
      }
      setPolls(fetchedPolls.reverse());
    } catch (e) {
      console.error('Failed to fetch polls:', e);
      setError('Could not load polls.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [provider]);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !question.trim() || !options.trim()) return;

    const optionsArray = options.split(',').map((opt) => opt.trim());
    if (optionsArray.length < 2) {
      setError('Please provide at least two options, separated by commas.');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const hubContract = new Contract(HARDCODED_HUB_ADDRESS, HUB_ABI, signer);
      const tx = await hubContract.createPoll(
        question,
        optionsArray,
        parseInt(duration)
      );
      await tx.wait();

      setQuestion('');
      setOptions('');
      fetchPolls();
    } catch (e) {
      console.error('Failed to create poll:', e);
      setError('Failed to create poll. Do you have permission?');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="polling-station">
      <h2>Polls & Votes</h2>

      {isConnected && (
        <form onSubmit={handleCreatePoll} className="poll-form">
          <h3>Create a New Poll</h3>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's the question?"
            disabled={isCreating}
          />
          <input
            type="text"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Options, separated by commas (e.g., Yes, No)"
            disabled={isCreating}
          />
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={isCreating}
          >
            <option value="3600">1 Hour</option>
            <option value="86400">1 Day</option>
            <option value="604800">1 Week</option>
          </select>
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Submitting...' : 'Create Poll'}
          </button>
        </form>
      )}

      {isLoading && <p>Loading polls...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="poll-list">
        {polls.map((poll) => (
          <PollCard
            key={Number(poll.id)}
            poll={poll}
            onVoteSuccess={fetchPolls}
          />
        ))}
      </div>
    </div>
  );
};
