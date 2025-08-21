
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';

const ADMIN_SECRET_ID = 'ADMIN-1234';

const JudgeLoginPage: React.FC = () => {
  const [secretId, setSecretId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state } = useAppContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Sanitize input by removing ALL whitespace, not just leading/trailing.
    // This makes the login more robust against copy-paste errors.
    const sanitizedId = secretId.replace(/\s/g, '');

    if (sanitizedId.toUpperCase() === ADMIN_SECRET_ID) {
        navigate('/admin');
        return;
    }

    const judge = state.judges.find(j => j.secret_id.toLowerCase() === sanitizedId.toLowerCase());
    if (judge) {
      navigate(`/judge/${judge.secret_id}`);
    } else {
      setError('ACCESS DENIED: Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Header title="AI HACKATHON" subtitle="SCORING INTERFACE" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AUTHENTICATION</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="text"
            placeholder=">// ENTER ACCESS ID"
            value={secretId}
            onChange={(e) => {
              setSecretId(e.target.value);
              setError('');
            }}
            className="font-mono text-lg"
          />
          {error && <p className="text-danger text-sm font-mono animate-pulse">{error}</p>}
          <Button type="submit" className="w-full">
            [ Authenticate ]
          </Button>
        </form>
      </Card>
      <div className="mt-8 text-center p-4 border border-primary/30 rounded-lg max-w-md w-full bg-secondary-bg/50 space-y-2">
        <p className="text-primary text-sm font-mono [text-shadow:0_0_6px_theme(colors.primary)]">
            // HINT: Admin ID is <span className="text-accent font-bold bg-dark-bg px-2 py-1 rounded [text-shadow:none]">ADMIN-1234</span>
        </p>
        <p className="text-primary text-sm font-mono [text-shadow:0_0_6px_theme(colors.primary)]">
            // Judge ID format: <span className="text-accent font-bold bg-dark-bg px-2 py-1 rounded [text-shadow:none]">JUDGENAME-HACK</span>
        </p>
      </div>
    </div>
  );
};

export default JudgeLoginPage;
