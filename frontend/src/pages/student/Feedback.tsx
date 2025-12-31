import FeedbackForm from '../../components/FeedbackForm';

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';

const StudentFeedback = () => {
  const { user } = useAuth();

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type="profile_incomplete" role="student" />;
  }

  return <FeedbackForm role="student" />;
};

export default StudentFeedback;
