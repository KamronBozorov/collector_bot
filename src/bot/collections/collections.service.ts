import { Injectable } from '@nestjs/common';
import { Collection } from '../models/collections.model';
import { InjectModel } from '@nestjs/sequelize';
import { Context } from 'telegraf';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection) private readonly model: typeof Collection,
  ) {}

  async findAll(): Promise<Collection[] | null> {
    const collections = await this.model.findAll({});

    return collections.length > 0 ? collections : null;
  }

  async create(ctx: Context) {}
}
