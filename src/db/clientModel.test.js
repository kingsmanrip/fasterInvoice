const ClientModel = require('./clientModel');
const db = require('./database');

// Mock the database
jest.mock('./database', () => ({
  prepare: jest.fn().mockReturnThis(),
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
}));

describe('ClientModel', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all clients', () => {
      // Mock the database response
      db.all.mockReturnValue([
        { id: 1, name: 'Client 1', email: 'client1@example.com' },
        { id: 2, name: 'Client 2', email: 'client2@example.com' }
      ]);

      const clients = ClientModel.getAll();

      expect(clients).toHaveLength(2);
      expect(clients[0].name).toBe('Client 1');
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return a client by id', () => {
      // Mock the database response
      db.get.mockReturnValue({
        id: 1,
        name: 'Client 1',
        email: 'client1@example.com'
      });

      const client = ClientModel.getById(1);

      expect(client).toBeDefined();
      expect(client.name).toBe('Client 1');
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(Object), 1);
    });

    it('should return null if client not found', () => {
      // Mock the database response
      db.get.mockReturnValue(undefined);

      const client = ClientModel.getById(999);

      expect(client).toBeNull();
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(Object), 999);
    });
  });

  describe('create', () => {
    it('should create a new client', () => {
      // Mock the database response
      db.run.mockReturnValue({ lastInsertRowid: 3 });
      db.get.mockReturnValue({
        id: 3,
        name: 'New Client',
        email: 'newclient@example.com'
      });

      const clientData = {
        name: 'New Client',
        email: 'newclient@example.com'
      };

      const client = ClientModel.create(clientData);

      expect(client).toBeDefined();
      expect(client.id).toBe(3);
      expect(client.name).toBe('New Client');
      expect(db.run).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an existing client', () => {
      // Mock the database response
      db.run.mockReturnValue({});
      db.get.mockReturnValue({
        id: 1,
        name: 'Updated Client',
        email: 'updated@example.com'
      });

      const clientData = {
        name: 'Updated Client',
        email: 'updated@example.com'
      };

      const client = ClientModel.update(1, clientData);

      expect(client).toBeDefined();
      expect(client.name).toBe('Updated Client');
      expect(db.run).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a client', () => {
      // Mock the database response
      db.run.mockReturnValue({});

      ClientModel.delete(1);

      expect(db.run).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(Object), 1);
    });
  });
});
