import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and fetch an order', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({ restaurantId: 'rest1', items: [{ itemId: 'biryani', name: 'Chicken Biryani', quantity: 1, price: 250 }] });
    expect(create.status).toBe(201);
    const orderId = create.body.id;
    const fetch = await request(app.getHttpServer()).get(`/api/v1/orders/${orderId}`);
    expect(fetch.status).toBe(200);
    expect(fetch.body.total).toBe(250);
  });
});


