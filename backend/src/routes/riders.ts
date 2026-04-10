import { Router } from 'express';
import ridersController from '../controllers/ridersController';
import { validateImportCsv, validateRider } from '../middleware/validation';

const router = Router();

router.get('/ranking', ridersController.ranking);
router.post('/import-csv', validateImportCsv, ridersController.importCsv);
router.get('/', ridersController.list);
router.post('/', validateRider, ridersController.create);
router.delete('/:id', ridersController.remove);

export default router;
