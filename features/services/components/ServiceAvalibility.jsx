'use client';

import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ServiceAvailability = () => {
  const availabilityInfo = [
    {
      icon: 'error',
      text: 'Services operate Monday-Friday, 9 AM-6 PM IST.'
    },
    {
      icon: 'error',
      text: 'Weekends and national holidays are non-working days.'
    },
    {
      icon: 'success',
      text: 'Delivery timelines are calculated based on working hours only.'
    },
    {
      icon: 'success',
      text: 'Requests raised outside working hours are handled next business day.'
    }
  ];

  return (
    <section style={{ backgroundColor: '#F5F5E8', padding: '48px 16px' }}>
      <div className="max-w-7xl mx-auto"
        style={{
          paddingTop: 'clamp(24px, 4vw, 48px)',
          paddingBottom: 'clamp(24px, 4vw, 48px)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Typography
            variant="h2"
            className="font-bold mb-3"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
              fontWeight: 700,
              color: '#1F2937'
            }}
          >
            Service Availability
          </Typography>
          <Typography
            sx={{
              fontSize: '16px',
              color: '#6B7280',
              marginBottom: '32px'
            }}
          >
            Our team works on business days to ensure quality and consistency.
          </Typography>
        </div>

        {/* Working Hours Badge */}
        <div className="flex justify-center mb-12">
          <Box
            className="flex items-center gap-3 px-8 py-4 rounded-full"
            sx={{
              backgroundColor: '#E8F5E6',
              border: '1px solid #D1E7CE'
            }}
          >
            <CheckCircleIcon sx={{ color: '#45A735', fontSize: '28px' }} />
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#1F2937'
              }}
            >
              Monday–Friday • 9 AM – 6 PM IST
            </Typography>
          </Box>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availabilityInfo.map((item, index) => (
            <Card
              key={index}
              className="p-6"
              sx={{
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                minHeight: '180px'
              }}
            >
              {/* Icon */}
              <Box
                className="flex items-center justify-center rounded-full"
                sx={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: item.icon === 'error' ? '#FEE2E2' : '#E8F5E6'
                }}
              >
                {item.icon === 'error' ? (
                  <CancelIcon sx={{ color: '#EF4444', fontSize: '28px' }} />
                ) : (
                  <CheckCircleIcon sx={{ color: '#45A735', fontSize: '28px' }} />
                )}
              </Box>

              {/* Text */}
              <Typography
                sx={{
                  fontSize: '15px',
                  color: '#6B7280',
                  lineHeight: 1.6,
                  flex: 1
                }}
              >
                {item.text}
              </Typography>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceAvailability;
