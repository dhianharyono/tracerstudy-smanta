import SmartMatchChat from '@/components/college-plan/SmartMatchChat';

const AdminAiAssistant = () => {
  return (
    <div className='w-full h-full animate-fade-in'>
      <SmartMatchChat initialRole='admin' isFullScreen />
    </div>
  );
};

export default AdminAiAssistant;
