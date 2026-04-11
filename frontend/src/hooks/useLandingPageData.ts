import { useState, useEffect } from 'react';
import axios from 'axios';
import { LandingPageStats, Testimonial } from '../types';

export const useLandingPageData = () => {
  const [stats, setStats] = useState<LandingPageStats | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const logVisit = async () => {
      try {
        await axios.post('/api/public/log-visit', { path: '/', menuName: 'Landing Page' });
      } catch (error) {
        console.error('Error logging visit:', error);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, testimonialsRes] = await Promise.all([
          axios.get('/api/public/stats'),
          axios.get('/api/public/testimonials'),
          logVisit(),
        ]);
        setStats(statsRes.data);
        setTestimonials(testimonialsRes.data);
      } catch (err: any) {
        console.error('Error fetching landing page data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, testimonials, loading, error };
};
