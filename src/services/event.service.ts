import axios, { AxiosResponse } from 'axios';

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL;

export async function uploadImage(file: Express.Multer.File): Promise<string> {
  const data = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  data.append('file', blob, file.originalname);
  const imageServiceResponse: AxiosResponse = await axios.post(`${IMAGE_SERVICE_URL}/upload`, data);
  return imageServiceResponse.data;
}
