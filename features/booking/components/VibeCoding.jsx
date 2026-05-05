'use client';

import Image from 'next/image';
import { useState } from 'react';

const VibeCoding = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-12 flex items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-5xl font-bold mb-2">
              Need Help With
            </h2>
            <h2 className="text-5xl font-bold mb-6" style={{ color: '#45A735' }}>
              Vibe Coding?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md">
              Get Matched With The Right Expert To Keep Building And Marketing
            </p>
            <button 
              className="text-white font-semibold px-8 py-3 rounded-lg transition-colors" 
              style={{ backgroundColor: isHovered ? '#3a8e2d' : '#45A735' }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Book Resource Now
            </button>
          </div>

          {/* Right Content - Profile Images */}
          <div className="flex-1 relative min-h-[400px]">
            <Image 
              src="/images/vibe-coding.png" 
              alt="Vibe Coding Team - Rohan and Akansha" 
              width={600}
              height={400}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VibeCoding;
