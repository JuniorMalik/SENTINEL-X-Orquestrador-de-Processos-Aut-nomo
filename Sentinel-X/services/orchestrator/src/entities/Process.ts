import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum ProcessStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  BOTTLENECK = "BOTTLENECK"
}

@Entity()
export class Process {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: ProcessStatus,
    default: ProcessStatus.PENDING
  })
  status!: ProcessStatus;

  @Column({ nullable: true })
  metadata!: string; // JSON string

  @Column({ default: 0 })
  durationMs!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
