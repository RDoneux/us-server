import { Router, Request, Response } from 'express';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

const eventController = Router();

eventController.get('/', getNumberOfEventsFromRange);
eventController.post('/', createEvent);
eventController.put('/:id', updateEvent);
eventController.delete('/:id', deleteEvent);

async function getNumberOfEventsFromRange(request: Request, response: Response) {
  try {
    const dateFrom: Date = new Date(request.query?.dateFrom as string);
    const itemNumber: number = Number(request.query?.itemNumber);

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

async function createEvent(request: Request, response: Response) {
  try {
    const event: Event = plainToClass(Event, request.body);
    const validationErrors: ValidationError[] = await validate(event);

    if (validationErrors.length) {
      response.status(400).json(validationErrors);
    }

    const savedEvent: Event = await EventRepository.save(event);

    response.status(201).json(savedEvent);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function updateEvent(request: Request, response: Response) {
  try {
    const id: string = request.params.id;
    const fieldsToUpdate: Partial<Event> = request.body;

    fieldsToUpdate.id = id;

    await EventRepository.save(fieldsToUpdate);
    response.status(200).json(await EventRepository.findOneBy({ id }));
  } catch (error) {
    response.status(500).json(error);
  }
}

async function deleteEvent(request: Request, response: Response) {
  try {
    const id: string = request.params.id;
    await EventRepository.delete(id);
    response.sendStatus(204);
  } catch (error) {
    response.status(500).json(error);
  }
}

export default eventController;
