import type { NextFunction, Request, Response } from 'express';
import { col, fn, Op } from 'sequelize';
import sequelize from '../config/database';
import Rider from '../models/Rider';
import NumberModel from '../models/Number';
import { parseRidersCsv } from '../utils/parseRidersCsv';

export interface RiderRankingRow {
  id: string;
  numero: number;
  nom: string;
  club: string;
  category: number;
  firstAcquisitionAt: string | null;
  rank: number;
}

export default {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      let where: Record<string, unknown> = {};

      if (search) {
        const num = parseInt(search, 10);
        const or: object[] = [
          { nom: { [Op.like]: `%${search}%` } },
          { club: { [Op.like]: `%${search}%` } }
        ];
        if (!Number.isNaN(num) && num >= 1 && num <= 1000) {
          or.push({ numero: num });
        }
        where = { [Op.or]: or };
      }

      const riders = await Rider.findAll({
        where,
        order: [['numero', 'ASC']]
      });

      res.json({ success: true, data: riders });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { numero, nom, club, category } = req.body as {
        numero: number;
        nom: string;
        club?: string;
        category: number;
      };
      const rider = await Rider.create({
        numero,
        nom,
        club: typeof club === 'string' ? club : '',
        category
      });
      res.status(201).json({ success: true, data: rider });
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(409).json({
          success: false,
          error: 'Ce numéro de dossard est déjà enregistré'
        });
        return;
      }
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
      if (!id) {
        res.status(400).json({ success: false, error: 'Identifiant manquant' });
        return;
      }
      const n = await Rider.destroy({ where: { id } });
      if (!n) {
        res.status(404).json({ success: false, error: 'Coureur introuvable' });
        return;
      }
      res.json({ success: true, message: 'Coureur supprimé' });
    } catch (error) {
      next(error);
    }
  },

  async importCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { csvText } = req.body as { csvText: string };
      let rows;
      try {
        rows = parseRidersCsv(csvText);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'CSV invalide';
        res.status(400).json({ success: false, error: msg });
        return;
      }

      const t = await sequelize.transaction();
      try {
        for (const row of rows) {
          const [rider, created] = await Rider.findOrCreate({
            where: { numero: row.numero },
            defaults: {
              nom: row.nom,
              club: row.club,
              category: row.category
            },
            transaction: t
          });
          if (!created) {
            await rider.update(
              { nom: row.nom, club: row.club, category: row.category },
              { transaction: t }
            );
          }
        }
        await t.commit();
        res.status(201).json({
          success: true,
          imported: rows.length,
          message: `${rows.length} coureur(s) importé(s) ou mis à jour`
        });
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (error) {
      next(error);
    }
  },

  /** Classement par date du premier enregistrement du dossard dans `numbers` (reconnaissance vocale) */
  async ranking(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aggregates = (await NumberModel.findAll({
        attributes: ['value', [fn('MIN', col('timestamp')), 'firstAt']],
        group: ['value'],
        raw: true
      })) as unknown as Array<{ value: number; firstAt: Date | string }>;

      const timeByDossard = new Map<number, Date>();
      for (const row of aggregates) {
        timeByDossard.set(
          row.value,
          row.firstAt instanceof Date ? row.firstAt : new Date(row.firstAt)
        );
      }

      const riders = (await Rider.findAll({ raw: true })) as unknown as Array<{
        id: string;
        numero: number;
        nom: string;
        club: string;
        category: number;
      }>;

      const sorted = [...riders].sort((a, b) => {
        const ta = timeByDossard.get(a.numero)?.getTime();
        const tb = timeByDossard.get(b.numero)?.getTime();
        const ia = ta ?? Number.POSITIVE_INFINITY;
        const ib = tb ?? Number.POSITIVE_INFINITY;
        if (ia !== ib) return ia - ib;
        return a.numero - b.numero;
      });

      const data: RiderRankingRow[] = sorted.map((row, i) => ({
        id: row.id,
        numero: row.numero,
        nom: row.nom,
        club: row.club ?? '',
        category: row.category,
        firstAcquisitionAt: timeByDossard.get(row.numero)
          ? timeByDossard.get(row.numero)!.toISOString()
          : null,
        rank: i + 1
      }));

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};
