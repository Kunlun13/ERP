import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';

export default function SessionGuard({ children }) {
  const { activeSessionId } = useSelector((s) => s.session);

  if (!activeSessionId) {
    return (
      <Card className="max-w-lg mx-auto mt-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Select Academic Session
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Please select an academic session from the navbar dropdown to continue.
        </p>
        <Link to="/select-session">
          <Button>Go to Session Selection</Button>
        </Link>
      </Card>
    );
  }

  return children;
}
