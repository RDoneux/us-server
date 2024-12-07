import { Router, Request, Response } from 'express';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import multer from 'multer';
import { uploadImage } from '../services/event.service';

const eventController = Router();

eventController.get('/:id', getEventById);
eventController.get('/', getNumberOfEventsFromRange);
eventController.post('/', multer().single('file'), createEvent);
eventController.put('/:id', multer().single('file'), updateEvent);
eventController.delete('/:id', deleteEvent);

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL;

async function getEventById(request: Request, response: Response) {
  try {
    const id: string = request.params.id;
    const event: Event | null = await EventRepository.findOneBy({ id });

    if (!event) {
      response.status(404).json('Event not found');
    }

    response.status(200).json(event);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getNumberOfEventsFromRange(request: Request, response: Response) {
  try {
    const dateFrom: Date = new Date(request.query?.dateFrom as string);
    const itemNumber: number = Number(request.query?.itemNumber);

    if (!dateFrom || !itemNumber) {
      response.status(400).json('dateFrom & itemNumber are required');
      return;
    }

    const events: Event[] = await EventRepository.getEventNumberFromRange(dateFrom, itemNumber);
    const totalEvents: number = await EventRepository.count();

    response.status(200).json({ ...events, totalEvents });
  } catch (error) {
    response.status(500).json(error);
  }
}

async function createEvent(request: Request, response: Response) {
  try {
    const event: Event = plainToClass(Event, request.body);
    const validationErrors: ValidationError[] = await validate(event);

    // save file to Image service
    if (!IMAGE_SERVICE_URL) {
      response.status(500).json('Image service URL is not defined');
      return;
    }

    if (!request.file) {
      response.status(400).json('File is required');
      return;
    }

    event.imageUrl = await uploadImage(request.file);

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

    if (request.file) {
      fieldsToUpdate.imageUrl = await uploadImage(request.file);
    }

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
