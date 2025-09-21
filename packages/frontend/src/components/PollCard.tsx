import { Contract } from 'ethers';
import { useFlare } from '../hooks/useFlare';
import { HARDCODED_HUB_ADDRESS, HUB_ABI } from '../constants';

export interface Poll {
  id: bigint;
  creator: string;
  question: string;
  options: string[];
  deadline: bigint;
}

interface PollCardProps {
  poll: Poll;
  onVoteSuccess: () => void;
}

export const PollCard = ({ poll, onVoteSuccess }: PollCardProps) => {
  const { signer } = useFlare();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (optionIndex: number) => {
    if (!signer) {
      setError('You must be connected to vote.');
      return;
    }
    setIsVoting(true);
    setError(null);
    try {
      const hubContract = new Contract(HARDCODED_HUB_ADDRESS, HUB_ABI, signer);
      const tx = await hubContract.vote(poll.id, optionIndex);
      await tx.wait();
      alert('Vote cast successfully!');
      onVoteSuccess();
    } catch (e: any) {
      console.error('Voting failed:', e);
      const errorMessage =
        e.reason || 'Transaction failed. Have you already voted?';
      setError(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  const isPollActive = BigInt(Date.now()) / 1000n < poll.deadline;
  const deadlineDate = new Date(Number(poll.deadline) * 1000).toLocaleString();

  return (
    <div className="poll-card">
      <h4>{poll.question}</h4>
      <div className="poll-options">
        {poll.options.map((option, index) => (
          <button
            key={index}
            className="poll-option-button"
            onClick={() => handleVote(index)}
            disabled={!isPollActive || isVoting}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="poll-meta">
        {isPollActive ? (
          <span>Ends: {deadlineDate}</span>
        ) : (
          <span>Ended: {deadlineDate}</span>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
