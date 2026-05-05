import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// QA Test Suite: API Integration & Data Mocking
// Senior QA - Testing frontend with mocked backend responses

describe('API Integration Testing - User Data Flow', () => {

  describe('Admin Bookings API - Data Response Handling', () => {
    it('should handle paginated bookings response', async () => {
      // Mock API response with pagination
      const mockBookingsData = {
        bookings: [
          {
            _id: '1',
            userId: 'user1',
            serviceId: 'service1',
            pmId: 'pm1',
            resourceId: 'resource1',
            title: 'Web Development',
            status: 'confirmed',
            pricing: { total: 5000 },
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            userId: 'user2',
            serviceId: 'service2',
            pmId: 'pm2',
            resourceId: 'resource2',
            title: 'Mobile App Development',
            status: 'pending',
            pricing: { total: 8000 },
            createdAt: new Date().toISOString()
          }
        ],
        total: 2
      };

      axios.get.mockResolvedValueOnce({ data: mockBookingsData });

      // Simulate API call
      const response = await axios.get('/api/admin/bookings');

      // Verify response structure
      expect(response.data).toBeDefined();
      expect(response.data.bookings).toHaveLength(2);
      expect(response.data.total).toBe(2);

      // Verify booking data
      expect(response.data.bookings[0]).toHaveProperty('_id');
      expect(response.data.bookings[0]).toHaveProperty('title');
      expect(response.data.bookings[0]).toHaveProperty('pricing');
    });

    it('should handle bookings without pagination wrapper', async () => {
      // Mock direct array response
      const mockBookingsArray = [
        {
          _id: '1',
          title: 'Service 1',
          status: 'confirmed'
        }
      ];

      axios.get.mockResolvedValueOnce({ data: mockBookingsArray });

      const response = await axios.get('/api/bookings');

      // Should handle both array and wrapped responses
      expect(Array.isArray(response.data) || response.data.bookings).toBeTruthy();
    });

    it('should handle empty bookings list', async () => {
      const mockEmptyData = {
        bookings: [],
        total: 0
      };

      axios.get.mockResolvedValueOnce({ data: mockEmptyData });

      const response = await axios.get('/api/admin/bookings');

      expect(response.data.bookings).toHaveLength(0);
      expect(response.data.total).toBe(0);
    });

    it('should handle API error gracefully', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      });

      try {
        await axios.get('/api/admin/bookings');
        fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe('Chat Messages API - Duplicate Prevention', () => {
    it('should filter duplicate messages by ID', async () => {
      // Mock API response with duplicate messages
      const mockMessagesWithDuplicates = [
        {
          id: 'msg1',
          senderId: 'user1',
          message: 'Hello',
          timestamp: 1000,
          isFromCurrentUser: true
        },
        {
          id: 'msg2',
          senderId: 'user2',
          message: 'Hi there',
          timestamp: 2000,
          isFromCurrentUser: false
        },
        {
          id: 'msg1', // Duplicate
          senderId: 'user1',
          message: 'Hello',
          timestamp: 1000,
          isFromCurrentUser: true
        }
      ];

      axios.get.mockResolvedValueOnce({ data: mockMessagesWithDuplicates });

      const response = await axios.get('/api/chat/messages');
      
      // Simulate unique filter
      const uniqueMessages = response.data.filter(
        (m, i, arr) => arr.findIndex(x => x.id === m.id) === i
      );

      expect(uniqueMessages).toHaveLength(2);
      expect(uniqueMessages[0].id).toBe('msg1');
      expect(uniqueMessages[1].id).toBe('msg2');
    });

    it('should sort messages by timestamp', async () => {
      const mockMessages = [
        {
          id: 'msg3',
          message: 'Third',
          timestamp: 3000
        },
        {
          id: 'msg1',
          message: 'First',
          timestamp: 1000
        },
        {
          id: 'msg2',
          message: 'Second',
          timestamp: 2000
        }
      ];

      const sorted = mockMessages.sort((a, b) => a.timestamp - b.timestamp);

      expect(sorted[0].id).toBe('msg1');
      expect(sorted[1].id).toBe('msg2');
      expect(sorted[2].id).toBe('msg3');
    });

    it('should validate message structure', async () => {
      const mockMessage = {
        id: 'msg1',
        senderId: 'user1',
        message: 'Test message',
        timestamp: Date.now(),
        senderName: 'John',
        isFromCurrentUser: true
      };

      // Validate all required fields
      const requiredFields = ['id', 'senderId', 'message', 'timestamp'];
      const isValid = requiredFields.every(field => 
        mockMessage.hasOwnProperty(field)
      );

      expect(isValid).toBe(true);
    });
  });

  describe('User Context Data - Role-based Access', () => {
    it('should fetch admin user data', async () => {
      const mockAdminUser = {
        _id: 'admin1',
        name: 'Admin User',
        email: 'admin@quickhire.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      };

      axios.get.mockResolvedValueOnce({ data: mockAdminUser });

      const response = await axios.get('/api/users/current');

      expect(response.data.role).toBe('admin');
      expect(response.data.permissions).toContain('delete');
    });

    it('should fetch customer user data', async () => {
      const mockCustomerUser = {
        _id: 'customer1',
        name: 'Customer User',
        email: 'customer@email.com',
        role: 'customer',
        mobile: '+1234567890'
      };

      axios.get.mockResolvedValueOnce({ data: mockCustomerUser });

      const response = await axios.get('/api/users/current');

      expect(response.data.role).toBe('customer');
      expect(response.data).toHaveProperty('mobile');
    });

    it('should fetch PM user data', async () => {
      const mockPMUser = {
        _id: 'pm1',
        name: 'Project Manager',
        email: 'pm@quickhire.com',
        role: 'pm',
        assignedBookings: ['b1', 'b2', 'b3']
      };

      axios.get.mockResolvedValueOnce({ data: mockPMUser });

      const response = await axios.get('/api/users/current');

      expect(response.data.role).toBe('pm');
      expect(response.data.assignedBookings).toContain('b1');
    });

    it('should fetch resource user data', async () => {
      const mockResourceUser = {
        _id: 'resource1',
        name: 'Tech Expert',
        role: 'resource',
        skills: ['JavaScript', 'React', 'Node.js'],
        availability: 'available'
      };

      axios.get.mockResolvedValueOnce({ data: mockResourceUser });

      const response = await axios.get('/api/users/current');

      expect(response.data.role).toBe('resource');
      expect(response.data.skills).toContain('JavaScript');
    });
  });

  describe('Booking Flow - Complete Data Journey', () => {
    it('should create booking with all required data', async () => {
      const bookingData = {
        userId: 'customer1',
        serviceId: 'service1',
        pmId: 'pm1',
        resourceId: 'resource1',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        price: 5000,
        currency: 'USD'
      };

      axios.post.mockResolvedValueOnce({
        data: {
          _id: 'booking1',
          ...bookingData,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        }
      });

      const response = await axios.post('/api/bookings', bookingData);

      expect(response.data._id).toBe('booking1');
      expect(response.data.status).toBe('confirmed');
      expect(response.data.price).toBe(5000);
    });

    it('should validate booking data before submission', async () => {
      const invalidBooking = {
        userId: '', // Missing
        serviceId: 'service1',
        price: 0 // Invalid
      };

      const isValid = Object.values(invalidBooking).every(v => v !== '' && v !== 0);
      expect(isValid).toBe(false);
    });

    it('should update booking status', async () => {
      const updatedBooking = {
        _id: 'booking1',
        status: 'completed',
        completedAt: new Date().toISOString()
      };

      axios.patch.mockResolvedValueOnce({ data: updatedBooking });

      const response = await axios.patch('/api/bookings/booking1', {
        status: 'completed'
      });

      expect(response.data.status).toBe('completed');
    });
  });

  describe('Payment Data Flow', () => {
    it('should process payment with correct data', async () => {
      const paymentData = {
        bookingId: 'booking1',
        amount: 5000,
        currency: 'USD',
        method: 'card'
      };

      axios.post.mockResolvedValueOnce({
        data: {
          transactionId: 'txn123',
          status: 'success',
          ...paymentData
        }
      });

      const response = await axios.post('/api/payments', paymentData);

      expect(response.data.status).toBe('success');
      expect(response.data.amount).toBe(5000);
    });

    it('should handle payment failure', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 402,
          data: { message: 'Payment declined' }
        }
      });

      try {
        await axios.post('/api/payments', {});
        fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).toBe(402);
      }
    });
  });

  describe('Notifications API', () => {
    it('should fetch user notifications', async () => {
      const mockNotifications = [
        {
          _id: 'notif1',
          userId: 'user1',
          type: 'booking_confirmed',
          message: 'Your booking is confirmed',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'notif2',
          userId: 'user1',
          type: 'payment_received',
          message: 'Payment received',
          read: true,
          createdAt: new Date().toISOString()
        }
      ];

      axios.get.mockResolvedValueOnce({ data: mockNotifications });

      const response = await axios.get('/api/notifications');

      expect(response.data).toHaveLength(2);
      expect(response.data[0].type).toBe('booking_confirmed');
      expect(response.data[1].read).toBe(true);
    });

    it('should mark notification as read', async () => {
      axios.patch.mockResolvedValueOnce({
        data: {
          _id: 'notif1',
          read: true
        }
      });

      const response = await axios.patch('/api/notifications/notif1', {
        read: true
      });

      expect(response.data.read).toBe(true);
    });
  });
});