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
});
