import { Router, Request, Response } from 'express';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';

const eventController = Router();

eventController.get('/', getNumberOfEventsFromRange);

async function getNumberOfEventsFromRange(request: Request, response: Response) {
  try {
    const dateFrom: Date = new Date(request.query?.dateFrom as string);
    const itemNumber: number = Number(request.query?.itemNumber);

    // check validity of dateFrom & itemNumber

    if (!dateFrom || !itemNumber) {
      response.status(400).json('dateFrom & itemNumber are required');
      return;
    }

    const events: Event[] = await EventRepository.getEventNumberFromRange(dateFrom, itemNumber);
    response.status(200).json(events);
  } catch (error) {
    response.status(500).json(error);
  }
}

export default eventController;
