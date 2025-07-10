import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(search?: string): Promise<Customer[]> {
    if (search) {
      return this.customerRepository.find({
        where: [
          { name: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ],
      });
    }
    return this.customerRepository.find();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByPhone(phone: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { phone } });
    if (!customer) {
      throw new NotFoundException(`Customer with phone ${phone} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    await this.customerRepository.update(id, updateCustomerDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  }

  async updateLoyalty(id: string, points: number, operation: 'add' | 'subtract' | 'set'): Promise<Customer> {
    const customer = await this.findOne(id);
    
    let newPoints: number;
    switch (operation) {
      case 'add':
        newPoints = customer.loyaltyPoints + points;
        break;
      case 'subtract':
        newPoints = Math.max(0, customer.loyaltyPoints - points);
        break;
      case 'set':
        newPoints = points;
        break;
    }

    await this.customerRepository.update(id, { loyaltyPoints: newPoints });
    return this.findOne(id);
  }
}
