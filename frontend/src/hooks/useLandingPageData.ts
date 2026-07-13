import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LandingPageStats, Testimonial } from '../types';

const fetchLandingStats = async () => {
  const res = await axios.get('/api/public/stats');
  return res.data;
};

const fetchLandingTestimonials = async () => {
  const res = await axios.get('/api/public/testimonials');
  return res.data;
};

export const useLandingPageData = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<LandingPageStats>({
    queryKey: ['landingStats'],
    queryFn: fetchLandingStats,
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  const { data: testimonials = [], isLoading: testimonialsLoading, error: testimonialsError } = useQuery<Testimonial[]>({
    queryKey: ['landingTestimonials'],
    queryFn: fetchLandingTestimonials,
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  useEffect(() => {
    const logVisit = async () => {
      try {
        await axios.post('/api/public/log-visit', { path: '/', menuName: 'Landing Page' });
      } catch (error) {
        console.error('Error logging visit:', error);
      }
    };
    logVisit();
  }, []);

  const loading = statsLoading || testimonialsLoading;
  const error = (statsError || testimonialsError) ? 'Failed to fetch landing page data' : null;

  return { stats: stats || null, testimonials, loading, error };
};
