import { Router } from 'express';
import { dbService } from '../services/dbService.js';
import { auditService } from '../services/auditService.js';
import { UserPersona } from '../../shared/types.js';

const router = Router();

router.post('/seed', async (req, res) => {
  try {
    const { persona } = req.body;
    const validPersonas: UserPersona[] = ['Student', 'Professional', 'Family Household', 'Remote Worker', 'Eco-Conscious User'];
    
    if (!persona || !validPersonas.includes(persona)) {
      return res.status(400).json({ 
        error: `Invalid persona: ${persona}. Must be one of: ${validPersonas.join(', ')}` 
      });
    }

    await dbService.seedDemoData(persona);
    await auditService.logEvent('DB_DEMO_SEED', 'judge-user', { seededPersona: persona });

    res.status(200).json({ message: `Successfully seeded DB with ${persona} demo data.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Seeding failed.' });
  }
});

export default router;
