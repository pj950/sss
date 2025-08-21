
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/ui/Header';
import { TrashIcon, LockClosedIcon, LockOpenIcon, ChevronDownIcon, ChevronUpIcon, VercelIcon } from '../components/icons';
import { exportScoresToCSV } from '../utils/export';
import type { Team, Judge, Criterion, Rating } from '../types';

const AdminPage: React.FC = () => {
    const { systemReset } = useAppContext();
    const [activeSection, setActiveSection] = useState('setup');

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Header title="Admin Mainframe" />
            <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2 border border-accent/40 rounded-lg p-1 bg-secondary-bg/50 backdrop-blur-sm">
                    <TabButton name="setup" activeSection={activeSection} setActiveSection={setActiveSection}>Setup</TabButton>
                    <TabButton name="control" activeSection={activeSection} setActiveSection={setActiveSection}>Control</TabButton>
                    <TabButton name="progress" activeSection={activeSection} setActiveSection={setActiveSection}>Progress</TabButton>
                    <TabButton name="results" activeSection={activeSection} setActiveSection={setActiveSection}>Results</TabButton>
                    <TabButton name="deploy" activeSection={activeSection} setActiveSection={setActiveSection}>Deploy</TabButton>
                </div>
                <Button variant="danger" onClick={systemReset}>System Reset</Button>
            </div>

            {activeSection === 'setup' && <SetupSection />}
            {activeSection === 'control' && <LiveControlSection />}
            {activeSection === 'progress' && <ProgressSection />}
            {activeSection === 'results' && <ResultsSection />}
            {activeSection === 'deploy' && <DeploySection />}
        </div>
    );
};

interface TabButtonProps {
    name: string;
    activeSection: string;
    setActiveSection: (name: string) => void;
    children: React.ReactNode;
}
const TabButton: React.FC<TabButtonProps> = ({ name, activeSection, setActiveSection, children }) => (
    <button
        onClick={() => setActiveSection(name)}
        className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 uppercase tracking-wider ${activeSection === name ? 'bg-accent text-white shadow-[0_0_10px_theme(colors.accent)]' : 'text-accent hover:bg-accent/20'}`}
    >
        {children}
    </button>
);

const SetupSection: React.FC = () => {
    const { state, addTeam, removeTeam, addJudge, removeJudge, addCriterion, removeCriterion, toggleLockSetup } = useAppContext();
    const [teamName, setTeamName] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [criterionName, setCriterionName] = useState('');
    const [maxScore, setMaxScore] = useState(10);

    const handleAddTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamName.trim()) {
            addTeam(teamName.trim());
            setTeamName('');
        }
    };

    const handleAddJudge = (e: React.FormEvent) => {
        e.preventDefault();
        if (judgeName.trim()) {
            addJudge(judgeName.trim());
            setJudgeName('');
        }
    };
    
    const handleAddCriterion = (e: React.FormEvent) => {
        e.preventDefault();
        if (criterionName.trim() && maxScore > 0) {
            addCriterion(criterionName.trim(), maxScore);
            setCriterionName('');
            setMaxScore(10);
        }
    };
    
    const canLock = state.teams.length > 0 && state.judges.length > 0 && state.criteria.length > 0;

    const handleLockToggle = () => {
        toggleLockSetup(!state.isSetupLocked);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <CardTitle>Event Config</CardTitle>
                        <Button
                            onClick={handleLockToggle}
                            disabled={!canLock && !state.isSetupLocked}
                            variant={state.isSetupLocked ? "secondary" : "primary"}
                        >
                            {state.isSetupLocked ? <LockClosedIcon className="h-5 w-5 mr-2 inline" /> : <LockOpenIcon className="h-5 w-5 mr-2 inline" />}
                            {state.isSetupLocked ? 'Unlock Config' : 'Lock Config'}
                        </Button>
                    </div>
                    <p className="text-light-text/80 mt-2">
                        {state.isSetupLocked 
                            ? "// Config locked. System is live and all changes are saved automatically."
                            : "// Add participants. All changes are saved automatically to the database."}
                    </p>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader><CardTitle>Teams ({state.teams.length})</CardTitle></CardHeader>
                    {!state.isSetupLocked && (
                        <form onSubmit={handleAddTeam} className="flex space-x-2 mb-4">
                            <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="New team name" />
                            <Button type="submit" variant="secondary">+</Button>
                        </form>
                    )}
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {state.teams.map(team => (
                            <li key={team.id} className="flex justify-between items-center bg-secondary-bg p-2 rounded">
                                <span>{team.name}</span>
                                {!state.isSetupLocked && <button onClick={() => removeTeam(team.id)}><TrashIcon className="h-5 w-5 text-danger hover:text-danger/80" /></button>}
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Judges ({state.judges.length})</CardTitle></CardHeader>
                    {!state.isSetupLocked && (
                        <form onSubmit={handleAddJudge} className="flex space-x-2 mb-4">
                            <Input value={judgeName} onChange={e => setJudgeName(e.target.value)} placeholder="New judge name" />
                            <Button type="submit" variant="secondary">+</Button>
                        </form>
                    )}
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {state.judges.map(judge => (
                            <li key={judge.id} className="flex justify-between items-center bg-secondary-bg p-2 rounded">
                                <div>
                                    <p>{judge.name}</p>
                                    <p className="text-xs text-primary font-mono">{judge.secret_id}</p>
                                </div>
                                {!state.isSetupLocked && <button onClick={() => removeJudge(judge.id)}><TrashIcon className="h-5 w-5 text-danger hover:text-danger/80" /></button>}
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Criteria ({state.criteria.length})</CardTitle></CardHeader>
                    {!state.isSetupLocked && (
                        <form onSubmit={handleAddCriterion} className="space-y-2 mb-4">
                            <Input value={criterionName} onChange={e => setCriterionName(e.target.value)} placeholder="Criterion name" />
                            <div className="flex space-x-2">
                                <Input type="number" value={maxScore} onChange={e => setMaxScore(parseInt(e.target.value))} placeholder="Max Score" />
                                <Button type="submit" variant="secondary">+</Button>
                            </div>
                        </form>
                    )}
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {state.criteria.map(c => (
                            <li key={c.id} className="flex justify-between items-center bg-secondary-bg p-2 rounded">
                                <span>{c.name} (Max: {c.max_score})</span>
                                {!state.isSetupLocked && <button onClick={() => removeCriterion(c.id)}><TrashIcon className="h-5 w-5 text-danger hover:text-danger/80" /></button>}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const LiveControlSection: React.FC = () => {
    const { state, setActiveTeam } = useAppContext();

    if (!state.isSetupLocked) {
        return <Card><CardTitle>System Offline</CardTitle><p className="text-light-text/80 mt-2">// Go to Setup and lock configuration to bring system online.</p></Card>;
    }
    
    const handleToggleActive = (teamId: string) => {
        if (state.activeTeamId === teamId) {
            setActiveTeam(null);
        } else {
            setActiveTeam(teamId);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Set Active Team</CardTitle>
                    <p className="text-light-text/80 mt-1">// Activate a team for scoring. Judges' dashboards will update in real-time.</p>
                </CardHeader>
                <div className="space-y-3">
                    {state.teams.map(team => {
                        const isActive = state.activeTeamId === team.id;
                        return (
                            <div key={team.id} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${isActive ? 'bg-accent/20 border border-accent' : 'bg-secondary-bg border border-transparent'}`}>
                                <span className={`text-lg font-medium ${isActive ? 'text-accent' : 'text-light-text'}`}>{team.name}</span>
                                <Button 
                                    onClick={() => handleToggleActive(team.id)}
                                    variant={isActive ? 'danger' : 'primary'}
                                >
                                    {isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        );
                    })}
                     {!state.teams.length && <p className="text-center text-light-text/80">// No teams configured.</p>}
                </div>
            </Card>
        </div>
    );
};

const ProgressSection: React.FC = () => {
    const { state } = useAppContext();
    const { teams, judges, ratings } = state;

    if (!state.isSetupLocked) {
        return <Card><CardTitle>System Offline</CardTitle><p className="text-light-text/80 mt-2">// Progress tracking available after config is locked.</p></Card>;
    }

    const totalPossibleRatings = teams.length * judges.length;
    const completedRatings = ratings.length;
    const progressPercentage = totalPossibleRatings > 0 ? (completedRatings / totalPossibleRatings) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rating Progress</CardTitle>
                <div className="mt-2">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-accent">{completedRatings} / {totalPossibleRatings} ratings logged</span>
                        <span className="text-sm font-medium text-accent">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-secondary-bg rounded-full h-2.5 border border-accent/40">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                </div>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-light-text/90">
                    <thead className="text-xs text-light-text uppercase bg-secondary-bg/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Team</th>
                            {judges.map(judge => <th key={judge.id} scope="col" className="px-6 py-3 text-center">{judge.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map(team => (
                            <tr key={team.id} className="border-b bg-secondary-bg border-accent/40 hover:bg-secondary-bg/80">
                                <th scope="row" className="px-6 py-4 font-medium text-light-text whitespace-nowrap">{team.name}</th>
                                {judges.map(judge => {
                                    const hasRated = ratings.some(r => r.team_id === team.id && r.judge_id === judge.id);
                                    return (
                                        <td key={judge.id} className="px-6 py-4 text-center">
                                            {hasRated ? 
                                                <span className="text-primary font-bold">✔</span> : 
                                                <span className="text-light-text/60">...</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const ResultsSection: React.FC = () => {
    const { state } = useAppContext();
    const { teams, judges, criteria, ratings } = state;

    if (!state.isSetupLocked) {
        return <Card><CardTitle>System Offline</CardTitle><p className="text-light-text/80 mt-2">// Results available after config is locked.</p></Card>;
    }
    
    const results = useMemo(() => teams.map(team => {
        const teamRatings = ratings.filter(r => r.team_id === team.id);
        const scoresByCriterion: Record<string, number[]> = {};
        criteria.forEach(c => scoresByCriterion[c.id] = []);

        teamRatings.forEach(r => {
            Object.entries(r.scores).forEach(([criterionId, score]) => {
                if (scoresByCriterion[criterionId]) {
                    scoresByCriterion[criterionId].push(score);
                }
            });
        });

        const finalScores = criteria.map(c => {
            const scores = scoresByCriterion[c.id];
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return { criterionName: c.name, score: avg };
        });

        const totalScore = finalScores.reduce((acc, curr) => acc + curr.score, 0);
        const avgScore = criteria.length > 0 ? totalScore / criteria.length : 0;

        return {
            teamId: team.id,
            teamName: team.name,
            finalScores,
            totalScore,
            avgScore
        };
    }).sort((a, b) => b.totalScore - a.totalScore), [teams, ratings, criteria]);
    
    return (
        <Card>
             <CardHeader className="flex justify-between items-center flex-wrap gap-4">
                <CardTitle>Final Results</CardTitle>
                <Button onClick={() => exportScoresToCSV(teams, judges, criteria, ratings)}>Export to CSV</Button>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-light-text/90">
                    <thead className="text-xs text-light-text uppercase bg-secondary-bg/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Rank</th>
                            <th scope="col" className="px-6 py-3">Team</th>
                            {criteria.map(c => <th key={c.id} scope="col" className="px-6 py-3">{c.name}</th>)}
                            <th scope="col" className="px-6 py-3">Total Score</th>
                            <th scope="col" className="px-6 py-3">Average Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((res, index) => (
                            <tr key={res.teamId} className="border-b bg-secondary-bg border-accent/40 hover:bg-secondary-bg/80">
                                <td className="px-6 py-4 text-xl font-bold font-heading text-accent [text-shadow:0_0_8px_theme(colors.accent)]">{index + 1}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-light-text whitespace-nowrap">{res.teamName}</th>
                                {res.finalScores.map(s => <td key={s.criterionName} className="px-6 py-4">{s.score.toFixed(2)}</td>)}
                                <td className="px-6 py-4 font-bold text-accent">{res.totalScore.toFixed(2)}</td>
                                <td className="px-6 py-4 font-bold text-primary">{res.avgScore.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const DeploySection: React.FC = () => {
    // This URL points to the Vercel template for a static site, which is what this project is.
    const REPO_URL = 'https://github.com/vercel/vercel/tree/main/examples/static';
    const vercelDeployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(REPO_URL)}&project-name=ai-hackathon-scorer&repository-name=ai-hackathon-scorer&stores=[{"type":"postgres"}]`;

    const cloudflareDocsUrl = 'https://developers.cloudflare.com/pages/get-started/git-integration/';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Deployment</CardTitle>
                <p className="text-light-text/80 mt-2">
                    Deploy this application to a cloud hosting service.
                </p>
            </CardHeader>
            <div className="space-y-6 pt-4">
                <div>
                    <h4 className="text-lg font-bold text-accent mb-2">Deploy with Vercel</h4>
                    <p className="text-light-text/90 mb-4">
                        Click the button below to deploy this application to Vercel and connect a Vercel Postgres database in one step.
                    </p>
                    <a
                        href={vercelDeployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md font-sans text-sm font-bold focus:outline-none transition-all duration-300 ease-in-out bg-black text-white hover:bg-gray-800"
                    >
                        <VercelIcon className="h-5 w-5 mr-2" />
                        Deploy with Vercel
                    </a>
                </div>
                <div>
                     <h4 className="text-lg font-bold text-primary mb-2">Deploy with Cloudflare Pages</h4>
                     <p className="text-light-text/90 mb-4">
                        You can also host this application on Cloudflare Pages, but it will require a separate database provider (like Neon or Supabase) as it does not have an integrated Postgres service like Vercel.
                    </p>
                    <Button 
                        variant="secondary"
                        onClick={() => window.open(cloudflareDocsUrl, '_blank')}
                    >
                        Read Cloudflare Docs
                    </Button>
                </div>
            </div>
        </Card>
    );
};


export default AdminPage;
