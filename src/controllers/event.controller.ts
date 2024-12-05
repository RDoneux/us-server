import { Router, Request, Response } from 'express';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import multer from 'multer';
import axios, { AxiosResponse } from 'axios';

const eventController = Router();

eventController.get('/', getNumberOfEventsFromRange);
eventController.post('/', multer().single('file'), createEvent);
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

    event.iconUrl = request.body.iconUrl;

    const validationErrors: ValidationError[] = await validate(event);

    // save file to Image service
    const imageServiceUrl = process.env.IMAGE_SERVICE_URL;
    if (!imageServiceUrl) {
      response.status(500).json('Image service URL is not defined');
      return;
    }

    const data = new FormData();
    if (!request.file) {
      response.status(400).json('File is required');
      return;
    }

    const blob = new Blob([request.file.buffer], { type: request.file.mimetype });
    data.append('file', blob, request.file.originalname);
    const imageServiceResponse: AxiosResponse = await axios.post(`${imageServiceUrl}/upload`, data);
    event.imageUrl = imageServiceResponse.data;

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
