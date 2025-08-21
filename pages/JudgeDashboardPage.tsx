
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import type { Rating } from '../types';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';

const JudgeDashboardPage: React.FC = () => {
  const { secretId } = useParams<{ secretId: string }>();
  const { state, submitRating } = useAppContext();
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const judge = useMemo(() => state.judges.find(j => j.secret_id === secretId), [state.judges, secretId]);
  const activeTeam = useMemo(() => state.teams.find(t => t.id === state.activeTeamId), [state.teams, state.activeTeamId]);

  const hasAlreadyRated = useMemo(() => {
    if (!judge || !activeTeam) return false;
    return state.ratings.some(r => r.judge_id === judge.id && r.team_id === activeTeam.id);
  }, [state.ratings, judge, activeTeam]);
  
  // Reset local scores when active team changes
  useEffect(() => {
    setScores({});
  }, [state.activeTeamId]);

  if (!judge) {
    // Wait for state to load, then redirect if still no judge
    if (state.judges.length > 0) return <Navigate to="/" />;
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judge || !activeTeam) return;

    const ratingData: Omit<Rating, 'judge_id'> = {
      team_id: activeTeam.id,
      scores: scores,
    };
    try {
        await submitRating(ratingData, judge.id);
        // No need to set "submitted" state, the UI will update automatically
        // when the next state poll completes.
    } catch(error) {
        console.error("Failed to submit rating:", error);
        alert("There was an error submitting your rating. Please try again.");
    }
  };
  
  const isFormComplete = state.criteria.length > 0 && Object.keys(scores).length === state.criteria.length;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header title={`JUDGE: ${judge.name}`} subtitle="Dashboard" />

      {!activeTeam && (
        <Card>
            <CardHeader>
                <CardTitle>Awaiting Target</CardTitle>
            </CardHeader>
            <p className="text-light-text/80">// Stand by. Administrator has not activated a team for rating.</p>
        </Card>
      )}

      {activeTeam && hasAlreadyRated && (
        <Card className="bg-primary/20 border-primary/50">
            <CardHeader className="border-primary/30">
                <CardTitle className="text-primary [text-shadow:0_0_8px_theme(colors.primary)]">Rating Sent: {activeTeam.name}</CardTitle>
            </CardHeader>
             <div className="p-6 space-y-2">
                <p className="text-light-text/80">// Your scores have been uploaded. The administrator can see your submission.</p>
                <p className="text-light-text/80 mt-2">// Awaiting next active team.</p>
            </div>
        </Card>
      )}

      {activeTeam && !hasAlreadyRated && (
        <Card>
          <CardHeader>
            <CardTitle>Target: {activeTeam.name}</CardTitle>
            <p className="text-light-text/80 mt-1">// Provide scores for each criterion below.</p>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {state.criteria.map(criterion => (
              <div key={criterion.id}>
                <label htmlFor={criterion.id} className="block text-lg font-medium text-light-text mb-2">
                  {criterion.name} <span className="text-light-text/70 font-normal">(0 - {criterion.max_score})</span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    id={criterion.id}
                    type="range"
                    min="0"
                    max={criterion.max_score}
                    step="1"
                    value={scores[criterion.id] || 0}
                    onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-secondary-bg/80 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <span className="text-2xl font-bold text-accent w-12 text-center font-mono">{scores[criterion.id] || 0}</span>
                </div>
              </div>
            ))}
            <div className="pt-4">
                <Button type="submit" className="w-full md:w-auto" disabled={!isFormComplete}>
                Submit for {activeTeam.name}
                </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default JudgeDashboardPage;
