import SmartMatchChat from '@/components/college-plan/SmartMatchChat';

const AlumniAiAssistant = () => {
  return (
    <div className='w-full h-full animate-fade-in'>
      <SmartMatchChat initialRole='alumni' isFullScreen />
    </div>
  );
};

export default AlumniAiAssistant;
