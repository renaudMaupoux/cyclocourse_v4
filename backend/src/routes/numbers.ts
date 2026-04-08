import { Router } from 'express';
import numbersController from '../controllers/numbersController';
import { validateNumber } from '../middleware/validation';

const router = Router();

router.get('/', numbersController.getAllNumbers);

router.get('/:id', numbersController.getNumber);

router.put('/:id', validateNumber, numbersController.updateNumber);

router.delete('/:id', numbersController.deleteNumber);

router.post('/reset', numbersController.resetNumbers);

export default router;
