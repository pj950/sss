
// This is a Vercel Serverless Function that acts as the API backend.
// It will be deployed to /api/index by Vercel.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as db from '../lib/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // GET request to fetch the entire state
    if (req.method === 'GET') {
      const state = await db.getState();
      return res.status(200).json(state);
    }

    // POST request to perform actions
    if (req.method === 'POST') {
      const { action, payload } = req.body;

      switch (action) {
        case 'ADD_TEAM':
          await db.addTeam(payload.name);
          break;
        case 'REMOVE_TEAM':
          await db.removeTeam(payload.id);
          break;
        case 'ADD_JUDGE':
          await db.addJudge(payload.name);
          break;
        case 'REMOVE_JUDGE':
          await db.removeJudge(payload.id);
          break;
        case 'ADD_CRITERION':
          await db.addCriterion(payload.name, payload.maxScore);
          break;
        case 'REMOVE_CRITERION':
          await db.removeCriterion(payload.id);
          break;
        case 'SET_LOCK_SETUP':
          await db.setLockSetup(payload.isLocked);
          break;
        case 'SET_ACTIVE_TEAM':
          await db.setActiveTeam(payload.teamId);
          break;
        case 'SUBMIT_RATING':
          await db.submitRating({
              teamId: payload.team_id,
              judgeId: payload.judgeId,
              scores: payload.scores
          });
          break;
        case 'SYSTEM_RESET':
          await db.systemReset();
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
      
      return res.status(200).json({ success: true });
    }

    // Handle other methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
