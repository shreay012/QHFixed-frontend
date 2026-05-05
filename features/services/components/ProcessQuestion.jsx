'use client';

import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const ProcessQuestion = () => {
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);

  const technologies = [
    'Agentic workflow',
    'Gen AI Development',
    'LLM Integration',
    'Neutral Networks',
    'Langchain',
    'Hugging Face',
    'Deep Learning',
    'Predictive Analytics',
    'AI Chatbots',
    'Natural Language Processing (NLP)',
    'Prompt Engineering',
    'RAG Systems',
    'Computer Vision Solutions',
    'Vector Database Development',
    'Machine Learning Model Development & Optimization',
    'AI Model Integration',
  ];

  const handleToggle = (tech) => {
    setSelectedTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 2, md: 3 }, pb: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Typography
        sx={{
          fontSize: { xs: '20px', sm: '24px', md: '28px', lg: '32px' },
          fontWeight: 700,
          color: '#1F2937',
          mb: 2,
          pr: 2,
        }}
      >
        Choose what you need help with
      </Typography>

      {/* Subheading */}
      <Typography
        sx={{
          fontSize: { xs: '14px', sm: '15px', md: '16px' },
          color: '#9CA3AF',
          mb: { xs: 3, md: 4 },
        }}
      >
        Select one or more technologies you want to expert to work on.
      </Typography>

      {/* Technologies Grid */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {technologies.map((tech) => (
          <FormControlLabel
            key={tech}
            control={
              <Checkbox
                checked={selectedTechnologies.includes(tech)}
                onChange={() => handleToggle(tech)}
                icon={<CheckBoxOutlineBlankIcon sx={{ color: '#45A735' }} />}
                checkedIcon={<CheckBoxIcon sx={{ color: '#45A735' }} />}
                sx={{ mr: 1 }}
              />
            }
            label={tech}
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '50px',
              padding: { xs: '6px 12px', sm: '8px 16px', md: '8px 20px' },
              paddingLeft: { xs: '8px', sm: '10px', md: '12px' },
              margin: 0,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#45A735',
              },
              '& .MuiTypography-root': {
                fontSize: { xs: '14px', sm: '15px', md: '16px' },
                color: '#374151',
                fontWeight: 400,
              },
            }}
          />
        ))}
      </Box>

      {/* Helper Text */}
      <Typography
        sx={{
          fontSize: { xs: '13px', sm: '14px' },
          color: '#9CA3AF',
          mt: 3,
          fontStyle: 'italic',
        }}
      >
        Not sure? Pick the closest option — you can clarify later.
      </Typography>
    </Box>
  );
};

export default ProcessQuestion;
