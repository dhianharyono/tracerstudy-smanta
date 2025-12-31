import FeedbackForm from '../../components/FeedbackForm';

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';

const AlumniFeedback = () => {
  const { user } = useAuth();

  if (user?.questionnaireCompleted === false) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  return <FeedbackForm role='alumni' />;
};

export default AlumniFeedback;
