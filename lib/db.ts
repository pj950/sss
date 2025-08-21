
import { sql } from '@vercel/postgres';
import { AppState, Team, Judge, Criterion, Rating } from '../types';

// Vercel Postgres automatically uses environment variables for connection.

export async function getState(): Promise<AppState> {
  const [teams, judges, criteria, ratings, appState] = await Promise.all([
    sql`SELECT id, name FROM teams ORDER BY created_at ASC;`,
    sql`SELECT id, name, secret_id FROM judges ORDER BY created_at ASC;`,
    sql`SELECT id, name, max_score FROM criteria ORDER BY created_at ASC;`,
    sql`SELECT judge_id, team_id, scores FROM ratings;`,
    sql`SELECT is_setup_locked, active_team_id FROM app_state WHERE id = 1;`,
  ]);

  return {
    teams: teams.rows as Team[],
    judges: judges.rows as Judge[],
    criteria: criteria.rows as Criterion[],
    ratings: ratings.rows as Rating[],
    isSetupLocked: appState.rows[0]?.is_setup_locked || false,
    activeTeamId: appState.rows[0]?.active_team_id || null,
  };
}

export async function addTeam(name: string) {
  return sql`INSERT INTO teams (name) VALUES (${name});`;
}

export async function removeTeam(id: string) {
  return sql`DELETE FROM teams WHERE id = ${id};`;
}

export async function addJudge(name: string) {
  const secret_id = `${name.toUpperCase().replace(/\s/g, '')}-HACK`;
  return sql`INSERT INTO judges (name, secret_id) VALUES (${name}, ${secret_id});`;
}

export async function removeJudge(id: string) {
  return sql`DELETE FROM judges WHERE id = ${id};`;
}

export async function addCriterion(name: string, maxScore: number) {
  return sql`INSERT INTO criteria (name, max_score) VALUES (${name}, ${maxScore});`;
}

export async function removeCriterion(id: string) {
  return sql`DELETE FROM criteria WHERE id = ${id};`;
}

export async function setLockSetup(isLocked: boolean) {
  return sql`UPDATE app_state SET is_setup_locked = ${isLocked} WHERE id = 1;`;
}

export async function setActiveTeam(teamId: string | null) {
  return sql`UPDATE app_state SET active_team_id = ${teamId} WHERE id = 1;`;
}

export async function submitRating(rating: { teamId: string, judgeId: string, scores: Record<string, number> }) {
  const { teamId, judgeId, scores } = rating;
  const scoresJson = JSON.stringify(scores);
  
  return sql`
    INSERT INTO ratings (team_id, judge_id, scores)
    VALUES (${teamId}, ${judgeId}, ${scoresJson})
    ON CONFLICT (judge_id, team_id)
    DO UPDATE SET scores = EXCLUDED.scores;
  `;
}

export async function systemReset() {
    // Order matters due to foreign key constraints
    await sql`DELETE FROM ratings;`;
    await sql`DELETE FROM criteria;`;
    await sql`DELETE FROM judges;`;
    await sql`DELETE FROM teams;`;
    await sql`UPDATE app_state SET is_setup_locked = FALSE, active_team_id = NULL WHERE id = 1;`;
}
