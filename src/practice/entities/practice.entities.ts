import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Practice {
    @PrimaryGeneratedColumn()
    id!: number;
}