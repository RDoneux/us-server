import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
dotenv.config();

const _dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number.parseInt(process.env.MYSQL_PORT || '3306'),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [Event],
  logging: true,
  synchronize: false,
});

function getRandomDate(start: Date, end: Date): string {
  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const randomTimestamp = Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
  return new Date(randomTimestamp).toISOString().slice(0, 19).replace('T', ' ');
}

async function seedEventTable() {
  try {
    await _dataSource.initialize();

    const insertQuery = `
            INSERT INTO events (
                id,
                event_date,
                title,
                description,
                icon,
                image
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    for (let i = 0; i < 250; i++) {
      const id: string = v4();
      const eventDate = getRandomDate(
        new Date('2023-01-01T00:00:00'),
        new Date('2025-01-01T00:00:00')
      );

      const values = [
        id,
        eventDate,
        'Test Event',
        'Test Event Description',
        'Test Event Icon URL',
        'Test Event Image URL',
      ];

      await _dataSource.query(insertQuery, values);

      console.log('Event seeded Successfully: ', { id, eventDate });
    }
  } catch (error) {
    console.error('Error seeding database: ', error);
  } finally {
    await _dataSource.destroy();
  }
}

seedEventTable();
