import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

// Test utilities
import { createTestingModule, createTestUser, createTestIncident, clearDatabase } from './incidents.test-utils';

// Entities
import { Incident } from '../../src/modules/incidents/entities/incident.entity';
import { User } from '../../src/modules/users/entities/user.entity';
import { Comment } from '../../src/modules/incidents/entities/comment.entity';

// Services
import { IncidentsService } from '../../src/modules/incidents/incidents.service';
import { UsersService } from '../../src/modules/users/users.service';

// DTOs
import { CreateIncidentDto, UpdateIncidentStatusDto, AssignIncidentDto } from '../../src/modules/incidents/dto/create-incident.dto';
import { IncidentStatus, IncidentPriority, IncidentImpact } from '../../src/modules/incidents/enums/incident.enum';
import { UserRole } from '../../src/modules/users/enums/user-role.enum';

describe('IncidentsService', () => {
  let module: TestingModule;
  let incidentsService: IncidentsService;
  let usersService: UsersService;
  let incidentRepository: Repository<Incident>;
  let userRepository: Repository<User>;
  let commentRepository: Repository<Comment>;
  
  let adminUser: User;
  let managerUser: User;
  let regularUser: User;
  
  beforeAll(async () => {
    module = await createTestingModule();
    
    incidentsService = module.get<IncidentsService>(IncidentsService);
    usersService = module.get<UsersService>(UsersService);
    incidentRepository = module.get<Repository<Incident>>(getRepositoryToken(Incident));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    
    // Create test users
    adminUser = await createTestUser(usersService, { 
      email: 'admin@example.com', 
      role: UserRole.ADMIN 
    });
    
    managerUser = await createTestUser(usersService, { 
      email: 'manager@example.com', 
      role: UserRole.MANAGER 
    });
    
    regularUser = await createTestUser(usersService, { 
      email: 'user@example.com', 
      role: UserRole.USER 
    });
  });
  
  afterEach(async () => {
    await clearDatabase(module);
  });
  
  afterAll(async () => {
    await module.close();
  });
  
  describe('create', () => {
    it('should create a new incident', async () => {
      const createIncidentDto: CreateIncidentDto = {
        title: 'Test Incident',
        description: 'This is a test incident',
        priority: IncidentPriority.HIGH,
        impact: IncidentImpact.MEDIUM,
      };
      
      const result = await incidentsService.create(createIncidentDto, regularUser);
      
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createIncidentDto.title);
      expect(result.description).toBe(createIncidentDto.description);
      expect(result.priority).toBe(createIncidentDto.priority);
      expect(result.impact).toBe(createIncidentDto.impact);
      expect(result.status).toBe(IncidentStatus.OPEN);
      expect(result.reportedBy.id).toBe(regularUser.id);
    });
    
    it('should assign incident if assignee is provided', async () => {
      const createIncidentDto: CreateIncidentDto = {
        title: 'Test Assigned Incident',
        description: 'This incident is assigned',
        priority: IncidentPriority.MEDIUM,
        impact: IncidentImpact.LOW,
        assignedToId: managerUser.id,
      };
      
      const result = await incidentsService.create(createIncidentDto, regularUser);
      
      expect(result.assignedTo.id).toBe(managerUser.id);
      expect(result.status).toBe(IncidentStatus.IN_PROGRESS);
    });
  });
  
  describe('findAll', () => {
    it('should return all incidents for admin', async () => {
      // Create test incidents
      await createTestIncident(incidentsService, regularUser, { title: 'Incident 1' });
      await createTestIncident(incidentsService, managerUser, { title: 'Incident 2' });
      
      const result = await incidentsService.findAll({}, { page: 1, limit: 10 }, adminUser);
      
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });
    
    it('should filter incidents by status', async () => {
      const incident1 = await createTestIncident(incidentsService, regularUser, { 
        title: 'Open Incident',
        status: IncidentStatus.OPEN,
      });
      
      const incident2 = await createTestIncident(incidentsService, regularUser, {
        title: 'In Progress Incident',
        status: IncidentStatus.IN_PROGRESS,
      });
      
      const result = await incidentsService.findAll(
        { status: [IncidentStatus.OPEN] },
        { page: 1, limit: 10 },
        adminUser
      );
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(incident1.id);
    });
  });
  
  describe('findOne', () => {
    it('should return incident by id', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser);
      
      const result = await incidentsService.findOne(testIncident.id, regularUser);
      
      expect(result.id).toBe(testIncident.id);
      expect(result.title).toBe(testIncident.title);
    });
    
    it('should throw NotFoundException if incident not found', async () => {
      const nonExistentId = uuidv4();
      
      await expect(
        incidentsService.findOne(nonExistentId, regularUser)
      ).rejects.toThrow(NotFoundException);
    });
    
    it('should allow access to assigned user', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser, {
        assignedToId: managerUser.id,
      });
      
      const result = await incidentsService.findOne(testIncident.id, managerUser);
      
      expect(result.id).toBe(testIncident.id);
    });
    
    it('should deny access to unauthorized user', async () => {
      const otherUser = await createTestUser(usersService, { email: 'other@example.com' });
      const testIncident = await createTestIncident(incidentsService, regularUser);
      
      await expect(
        incidentsService.findOne(testIncident.id, otherUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });
  
  describe('updateStatus', () => {
    it('should update incident status', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser);
      const updateStatusDto: UpdateIncidentStatusDto = {
        status: IncidentStatus.IN_PROGRESS,
        comment: 'Starting work on this incident',
      };
      
      const result = await incidentsService.updateStatus(
        testIncident.id,
        updateStatusDto,
        regularUser
      );
      
      expect(result.status).toBe(IncidentStatus.IN_PROGRESS);
      
      // Verify comment was added
      const incident = await incidentsService.findOne(testIncident.id, regularUser);
      expect(incident.comments).toHaveLength(1);
      expect(incident.comments[0].content).toBe(updateStatusDto.comment);
    });
    
    it('should set resolvedAt when status is RESOLVED', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser, {
        status: IncidentStatus.IN_PROGRESS,
      });
      
      const updateStatusDto: UpdateIncidentStatusDto = {
        status: IncidentStatus.RESOLVED,
        comment: 'Issue has been resolved',
      };
      
      const result = await incidentsService.updateStatus(
        testIncident.id,
        updateStatusDto,
        regularUser
      );
      
      expect(result.status).toBe(IncidentStatus.RESOLVED);
      expect(result.resolvedAt).toBeDefined();
      expect(result.resolutionNotes).toBe(updateStatusDto.comment);
    });
    
    it('should prevent invalid status transitions', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser, {
        status: IncidentStatus.OPEN,
      });
      
      const updateStatusDto: UpdateIncidentStatusDto = {
        status: IncidentStatus.CLOSED, // Can't directly close an open incident
      };
      
      await expect(
        incidentsService.updateStatus(testIncident.id, updateStatusDto, regularUser)
      ).rejects.toThrow(BadRequestException);
    });
  });
  
  describe('assignIncident', () => {
    it('should assign incident to user', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser);
      const assignDto: AssignIncidentDto = {
        assigneeId: managerUser.id,
        comment: 'Assigning to manager',
      };
      
      const result = await incidentsService.assignIncident(
        testIncident.id,
        assignDto,
        adminUser
      );
      
      expect(result.assignedTo.id).toBe(managerUser.id);
      expect(result.status).toBe(IncidentStatus.IN_PROGRESS);
      
      // Verify comment was added
      const incident = await incidentsService.findOne(testIncident.id, adminUser);
      expect(incident.comments).toHaveLength(1);
      expect(incident.comments[0].content).toBe(assignDto.comment);
    });
    
    it('should update status to IN_PROGRESS when assigned', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser, {
        status: IncidentStatus.OPEN,
      });
      
      const assignDto: AssignIncidentDto = {
        assigneeId: managerUser.id,
      };
      
      const result = await incidentsService.assignIncident(
        testIncident.id,
        assignDto,
        adminUser
      );
      
      expect(result.status).toBe(IncidentStatus.IN_PROGRESS);
    });
  });
  
  describe('addComment', () => {
    it('should add a comment to an incident', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser);
      const commentDto = {
        content: 'This is a test comment',
        isInternal: false,
      };
      
      const result = await incidentsService.addComment(
        testIncident.id,
        commentDto,
        regularUser
      );
      
      expect(result.content).toBe(commentDto.content);
      expect(result.isInternal).toBe(commentDto.isInternal);
      expect(result.user.id).toBe(regularUser.id);
      
      // Verify comment is associated with the incident
      const incident = await incidentsService.findOne(testIncident.id, regularUser);
      expect(incident.comments).toHaveLength(1);
      expect(incident.comments[0].id).toBe(result.id);
    });
  });
  
  describe('remove', () => {
    it('should soft delete an incident', async () => {
      const testIncident = await createTestIncident(incidentsService, regularUser);
      
      await incidentsService.remove(testIncident.id, regularUser);
      
      // Verify soft delete
      const incident = await incidentRepository.findOne({
        where: { id: testIncident.id },
        withDeleted: true,
      });
      
      expect(incident).toBeDefined();
      expect(incident.deletedAt).toBeDefined();
    });
    
    it('should prevent unauthorized deletion', async () => {
      const otherUser = await createTestUser(usersService, { email: 'other@example.com' });
      const testIncident = await createTestIncident(incidentsService, regularUser);
      
      await expect(
        incidentsService.remove(testIncident.id, otherUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });
  
  describe('getIncidentStats', () => {
    it('should return correct incident statistics', async () => {
      // Create incidents in different statuses
      await createTestIncident(incidentsService, regularUser, { status: IncidentStatus.OPEN });
      await createTestIncident(incidentsService, regularUser, { status: IncidentStatus.IN_PROGRESS });
      await createTestIncident(incidentsService, regularUser, { status: IncidentStatus.IN_PROGRESS });
      await createTestIncident(incidentsService, regularUser, { status: IncidentStatus.RESOLVED });
      await createTestIncident(incidentsService, regularUser, { status: IncidentStatus.CLOSED });
      
      const stats = await incidentsService.getIncidentStats();
      
      expect(stats.open).toBe(1);
      expect(stats.in_progress).toBe(2);
      expect(stats.resolved).toBe(1);
      expect(stats.closed).toBe(1);
      expect(stats.total).toBe(5);
    });
  });
});
