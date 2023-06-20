import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { catchError, timeout } from 'rxjs';
import { AppService } from './app.service';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_2') private readonly kafka2: ClientKafka,
  ) {}

  @Get()
  async getHello() {
    const res = new Promise((resolve, reject) => {
      this.kafka2
        .send('test-KAFKA_1', JSON.stringify({ message: 'test' }))
        .subscribe((data) => {
          resolve(data);
        });
    });

    const data = Promise.all([res]);
    const helloWorld = await data;
    console.log(helloWorld[0]);

    return this.appService.getHello();
  }

  onModuleInit() {
    this.kafka2.subscribeToResponseOf('test-KAFKA_1');
    this.kafka2.connect();
  }
}
