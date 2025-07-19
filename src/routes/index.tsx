import LoginPage from '@/pages/login';
import MeetingRoom from '@/pages/meeting-room';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function MeetingAppRoute() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/room/:room_code" element={<MeetingRoom />} />
      </Routes>
    </Router>
  );
}

export default MeetingAppRoute;
