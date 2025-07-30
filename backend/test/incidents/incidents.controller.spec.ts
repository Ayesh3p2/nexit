import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/modules/users/entities/user.entity';
import { Incident } from '../../src/modules/incidents/entities/incident.entity';
import { UserRole } from '../../src/modules/users/enums/user-role.enum';
import { IncidentStatus, IncidentPriority, IncidentImpact } from '../../src/modules/incidents/enums/incident.enum';

describe('IncidentsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let testIncident: Incident;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    
    connection = module.get<Connection>(Connection);
    jwtService = module.get<JwtService>(JwtService);
    
    // Create test users and get tokens
    const userRepo = connection.getRepository(User);
    const admin = await userRepo.save({
      email: 'admin@test.com',
      password: await bcrypt.hash('password', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    
    const user = await userRepo.save({
      email: 'user@test.com',
      password: await bcrypt.hash('password', 10),
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
    });
    
    adminToken = jwtService.sign({ sub: admin.id, email: admin.email, role: admin.role });
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    
    // Create a test incident
    testIncident = await connection.getRepository(Incident).save({
      title: 'Test Incident',
      description: 'Test Description',
      priority: IncidentPriority.MEDIUM,
      impact: IncidentImpact.MEDIUM,
      status: IncidentStatus.OPEN,
      reportedBy: user,
    });
  });
  
  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
  });
  
  describe('POST /incidents', () => {
    it('should create a new incident (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/incidents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Incident',
          description: 'New Description',
          priority: IncidentPriority.HIGH,
          impact: IncidentImpact.MEDIUM,
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Incident');
    });
  });
  
  describe('GET /incidents', () => {
    it('should return incidents (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/incidents')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.total).toBeDefined();
    });
  });
  
  describe('GET /incidents/:id', () => {
    it('should return incident by id (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/incidents/${testIncident.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body.id).toBe(testIncident.id);
      expect(response.body.title).toBe(testIncident.title);
    });
  });
  
  describe('PATCH /incidents/:id/status', () => {
    it('should update status (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/incidents/${testIncident.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: IncidentStatus.IN_PROGRESS })
        .expect(200);
      
      expect(response.body.status).toBe(IncidentStatus.IN_PROGRESS);
    });
  });
  
  describe('POST /incidents/:id/comments', () => {
    it('should add comment (201)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/incidents/${testIncident.id}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Test comment', isInternal: false })
        .expect(201);
      
      expect(response.body.content).toBe('Test comment');
    });
  });
  
  describe('DELETE /incidents/:id', () => {
    it('should delete incident (204)', async () => {
      await request(app.getHttpServer())
        .delete(`/incidents/${testIncident.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
