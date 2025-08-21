
import type { Team, Judge, Criterion, Rating } from '../types';

export const exportDataToJSON = (data: any, filename: string) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportScoresToCSV = (teams: Team[], judges: Judge[], criteria: Criterion[], ratings: Rating[]) => {
  if (!teams.length || !criteria.length) {
    alert("No data to export.");
    return;
  }
  
  const headers = ['Team', ...criteria.map(c => c.name), 'Total Score', 'Average Score'];
  
  const teamScores: Record<string, { scores: Record<string, number[]>, total: number }> = {};

  teams.forEach(team => {
    teamScores[team.id] = { scores: {}, total: 0 };
    criteria.forEach(c => {
      teamScores[team.id].scores[c.id] = [];
    });
  });

  ratings.forEach(rating => {
    if (teamScores[rating.team_id]) {
      Object.entries(rating.scores).forEach(([criterionId, score]) => {
        if (teamScores[rating.team_id].scores[criterionId]) {
          teamScores[rating.team_id].scores[criterionId].push(score);
        }
      });
    }
  });

  const rows = teams.map(team => {
    const teamData = teamScores[team.id];
    let totalScore = 0;
    const criterionScores = criteria.map(c => {
      const scores = teamData.scores[c.id] || [];
      if (scores.length === 0) return 'N/A';
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      totalScore += avg;
      return avg.toFixed(2);
    });

    const averageScore = criteria.length > 0 ? (totalScore / criteria.length).toFixed(2) : '0.00';
    return [team.name, ...criterionScores, totalScore.toFixed(2), averageScore];
  });

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "scoring_results.csv");
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link);
};
