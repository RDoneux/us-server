import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_date', type: 'timestamp' })
  date!: Date;

  @Column({ name: 'title', type: 'varchar' })
  title!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'icon', type: 'varchar' })
  iconUrl!: string;

  @Column({ name: 'image', type: 'varchar' })
  imageUrl!: string;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
