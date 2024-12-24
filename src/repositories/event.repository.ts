import { dataSource } from '../globals/data-source';
import { Event } from '../entities/event.entity';

export const EventRepository = dataSource.getRepository(Event).extend({
  getEventNumberFromRange(dateFrom: Date, itemNumber: number): Promise<Event[]> {
    return this.createQueryBuilder('event')
      .where('event.date <= :dateFrom', { dateFrom })
      .orderBy('event.date', 'DESC')
      .limit(itemNumber)
      .getMany();
  },

  getEventsFromDateRange(dateFrom: Date, dateTo: Date): Promise<Event[]> {
    return this.createQueryBuilder('event')
      .where('event.date >= :dateFrom', { dateFrom })
      .andWhere('event.date <= :dateTo', { dateTo })
      .orderBy('event.date', 'DESC')
      .getMany();
  },

  async getRecordsStartAndEndDate(): Promise<string[]> {
    const result = await this.createQueryBuilder('event')
      .select("DISTINCT DATE_FORMAT(event.date, '%Y-%m-01')", 'monthYear')
      .getRawMany();

    return result.map((row) => row.monthYear);
  },
});
