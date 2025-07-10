import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto, UpdateOfferDto } from './dto/offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offer = this.offerRepository.create(createOfferDto);
    return this.offerRepository.save(offer);
  }

  async findAll(branchId?: string, active?: boolean): Promise<Offer[]> {
    const query = this.offerRepository.createQueryBuilder('offer');

    if (branchId) {
      query.andWhere(':branchId = ANY(offer.branchIds)', { branchId });
    }

    if (active !== undefined) {
      query.andWhere('offer.isActive = :active', { active });
      if (active) {
        query.andWhere('offer.validFrom <= :now', { now: new Date() });
        query.andWhere('offer.validUntil >= :now', { now: new Date() });
      }
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  async update(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    await this.offerRepository.update(id, updateOfferDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.offerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
  }

  async apply(id: string, orderId: string): Promise<Offer> {
    const offer = await this.findOne(id);
    
    if (!offer.isActive) {
      throw new BadRequestException('Offer is not active');
    }

    const now = new Date();
    if (now < offer.validFrom || now > offer.validUntil) {
      throw new BadRequestException('Offer is not valid at this time');
    }

    if (offer.maxUses && offer.currentUses >= offer.maxUses) {
      throw new BadRequestException('Offer has reached maximum uses');
    }

    await this.offerRepository.update(id, {
      currentUses: offer.currentUses + 1,
    });

    return this.findOne(id);
  }
}
