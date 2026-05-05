'use client';

import Image from 'next/image';
import { Box, Typography, Container } from '@mui/material';

export default function AboutUsHero() {
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        pb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
        width: '100%'
      }}
    >

      
    <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 4, md: 2 } }}>
  <Typography
    variant="h1"
    sx={{
      fontSize: { xs: '24px', sm: '30px', md: '36px', lg: '60px' },
      fontWeight: 700,
      color: 'var(--text-primary)',
      lineHeight: 1.2,
      pt: { xs: 2, sm: 4, md: 4 },
      pb: { xs: 2, sm: 4, md: 2 }
    }}
  >
    About QuickHire
  </Typography>

  <Typography
    sx={{
      fontSize: { xs: '14px', sm: '16px', md: 'var(--font-size-24)' },
      color: 'var(--text-secondary)',
      marginBottom: { xs: '32px', sm: '48px', md: '64px' },
      fontWeight: 'var(--font-weight-400)'
    }}
  >
    A tech talent platform built on speed, quality, and trust.
  </Typography>
</Box>
      
      {/* Content Section */}
    <Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: { xs: 'center', md: 'flex-start' },
    gap: { xs: 4, sm: 6, md: 8, lg: 12 },
    width: '100%'
  }}
>
  {/* Image - 40% */}
  <Box
    sx={{
      flex: { xs: '0 0 auto', md: '0 0 40%' },
      position: 'relative',
      height: { xs: '280px', sm: '320px', md: '380px', lg: '400px' },
      minHeight: { xs: '280px', sm: '320px', md: '380px' },
      borderRadius: { xs: '12px', md: '16px' },
      overflow: 'hidden',
      width: { xs: '100%', md: 'auto' }
    }}
  >
    <Image
      src="/images/about/about_us.png"
      alt="About Us"
      fill
      style={{ objectFit: 'cover' }}
    />
  </Box>

  {/* Text - 60% */}
  <Box
    sx={{
      flex: { xs: 1, md: '0 0 60%' },
      width: { xs: '100%', md: 'auto' }
    }}
  >
    <Typography
      variant="h2"
      sx={{
        fontSize: { xs: '22px', sm: '28px', md: '42px', lg: '48px' },
        fontWeight: 'var(--font-weight-700)',
        color: '#484848',
        lineHeight: 1.2
      }}
    >
      Who We Are
    </Typography>

    <Box
      sx={{
        mt: { xs: 2, sm: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2, md: 2.5 }
      }}
    >
      <Typography 
        sx={{ 
          fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '20px' }, 
          color: '#636363', 
          fontWeight: 400, 
          lineHeight: { xs: 1.6, md: 1.7 } 
        }}
      >
        QuickHire is an on-demand tech talent platform trusted by leading organizations including BCG, IKEA, and JK Cement.
      </Typography>

      <Typography 
        sx={{ 
          fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '20px' }, 
          color: '#636363', 
          fontWeight: 400, 
          lineHeight: { xs: 1.6, md: 1.7 } 
        }}
      >
        We connect businesses with pre-vetted tech professionals in 10 minutes across software development, UI/UX design, AI engineering, cloud architecture, cybersecurity, enterprise technology, digital marketing, and more.
      </Typography>

      <Typography 
        sx={{ 
          fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '20px' }, 
          color: '#636363', 
          fontWeight: 400, 
          lineHeight: { xs: 1.6, md: 1.7 } 
        }}
      >
        Every professional in our network of 1,000+ has been individually assessed for technical ability and real-world performance before being made available to clients. We deliver talent you can trust, with quality and reliability your business deserves.
      </Typography>
    </Box>
  </Box>
</Box>
    </Container>
  );
}
