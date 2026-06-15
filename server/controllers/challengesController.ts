import { Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { auditService } from '../services/auditService.js';

export const challengesController = {
  async listChallenges(req: Request, res: Response) {
    try {
      const challenges = await dbService.getChallenges();
      const stats = await dbService.getUserStats();

      // Enrich challenges with completed boolean status based on user stats
      const enriched = challenges.map((challenge) => ({
        ...challenge,
        completed: stats.completedChallenges?.includes(challenge.id) || false
      }));

      res.status(200).json(enriched);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch challenges.' });
    }
  },

  async completeChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const challenges = await dbService.getChallenges();
      const challenge = challenges.find(c => c.id === id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found.' });
      }

      const stats = await dbService.getUserStats();
      if (stats.completedChallenges?.includes(id)) {
        return res.status(400).json({ error: 'Challenge already completed.' });
      }

      // Add to completed list
      const completed = [...(stats.completedChallenges || []), id];
      const points = stats.points + challenge.points;

      // Check achievements
      const achievements = [...(stats.unlockedAchievements || [])];
      
      if (completed.length >= 1 && !achievements.includes('Green Starter')) {
        achievements.push('Green Starter');
      }
      if (completed.length >= 3 && !achievements.includes('Climate Champion')) {
        achievements.push('Climate Champion');
      }
      if (completed.length >= 5 && !achievements.includes('Eco Hero')) {
        achievements.push('Eco Hero');
      }
      if (completed.length === challenges.length && !achievements.includes('Sustainability Expert')) {
        achievements.push('Sustainability Expert');
      }

      const updated = await dbService.updateUserStats({
        points,
        completedChallenges: completed,
        unlockedAchievements: achievements,
        lastActive: new Date().toISOString()
      });

      // Audit Log
      await auditService.logEvent('CHALLENGE_COMPLETED', 'judge-user', {
        challengeId: id,
        pointsAwarded: challenge.points,
        newPointsTotal: points
      });

      res.status(200).json({
        message: 'Challenge completed successfully!',
        stats: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to complete challenge.' });
    }
  }
};
