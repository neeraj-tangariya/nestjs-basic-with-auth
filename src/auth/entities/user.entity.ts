import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Role enum
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  mfaOtpHash?: string | null;

  @Column({ type: 'datetime', nullable: true })
  mfaOtpExpiresAt?: Date | null;

  @Column({ default: false })
  mfaEmailVerified: boolean;

  @Column({ default: Role.USER })
  role: Role;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn({ nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;
}
