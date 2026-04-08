import type { NextFunction, Request, Response } from 'express';
import NumberModel from '../models/Number';

function routeParamId(param: string | string[] | undefined): string {
  if (param == null) return '';
  return Array.isArray(param) ? (param[0] ?? '') : param;
}

export default {
  async getAllNumbers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const numbers = await NumberModel.findAll({
        order: [['timestamp', 'DESC']]
      });

      res.json({
        success: true,
        count: numbers.length,
        data: numbers
      });
    } catch (error) {
      next(error);
    }
  },

  async getNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = routeParamId(req.params.id);
      const number = await NumberModel.findByPk(id);

      if (!number) {
        res.status(404).json({
          success: false,
          error: 'Chiffre non trouvé'
        });
        return;
      }

      res.json({
        success: true,
        data: number
      });
    } catch (error) {
      next(error);
    }
  },

  async updateNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = routeParamId(req.params.id);
      const { value } = req.body as { value: number };

      const number = await NumberModel.findByPk(id);

      if (!number) {
        res.status(404).json({
          success: false,
          error: 'Chiffre non trouvé'
        });
        return;
      }

      if (!number.get('originalValue')) {
        number.set('originalValue', number.get('value'));
      }
      number.set('value', value);
      number.set('isEdited', true);
      await number.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('number-updated', {
          id: number.get('id'),
          value: number.get('value'),
          isEdited: number.get('isEdited')
        });
      }

      res.json({
        success: true,
        message: 'Chiffre mis à jour avec succès',
        data: number
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = routeParamId(req.params.id);
      const number = await NumberModel.findByPk(id);

      if (!number) {
        res.status(404).json({
          success: false,
          error: 'Chiffre non trouvé'
        });
        return;
      }

      await number.destroy();

      const io = req.app.get('io');
      if (io) {
        io.emit('number-deleted', { id });
      }

      res.json({
        success: true,
        message: 'Chiffre supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  },

  async resetNumbers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await NumberModel.destroy({
        where: {},
        truncate: true
      });

      const io = _req.app.get('io');
      if (io) {
        io.emit('numbers-reset');
      }

      res.json({
        success: true,
        message: `${count} chiffre(s) supprimé(s)`,
        count
      });
    } catch (error) {
      next(error);
    }
  }
};
