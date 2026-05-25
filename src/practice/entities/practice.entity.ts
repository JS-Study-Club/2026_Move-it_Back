import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('practices')
export class Practice {
    @PrimaryGeneratedColumn()
    id!: number;
}