import { useNavigate } from 'react-router-dom'; // jika pakai Next.js, gunakan `useRouter` dari 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoIcon, CalendarClockIcon } from 'lucide-react';
import api from '@/config/api';
import { toast } from 'sonner';

const generateRandomString = (length = 7) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

const generateISOTime = () => {
  return new Date().toISOString(); // format: YYYY-MM-DDTHH:mm:ssZ (UTC)
};

const Dashboard = () => {
  const navigate = useNavigate();

  const handleClickInstantMeeting = async () => {
    try {
      const response = await api.post('/create-room', {
        room_name: generateRandomString(),
        start_time: generateISOTime(),
      });
      if (response.status === 201) {
        toast('Event has been created', {
          description: 'You can now share the link with your participants.',
        });
        navigate(`/room/${response.data.room_code}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16 px-4">
      <div className="max-w-3xl w-full text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Welcome to MeetSync</h1>
        <p className="text-gray-500">Start or schedule your online meeting with ease.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <Card className="hover:shadow-md transition-shadow border border-gray-200 cursor-pointer" onClick={handleClickInstantMeeting}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <VideoIcon className="h-5 w-5 text-blue-600" />
              Start Instant Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Launch a meeting immediately and share the link with participants.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border border-gray-200 cursor-pointer" onClick={() => navigate('/meeting/create')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <CalendarClockIcon className="h-5 w-5 text-green-600" />
              Schedule a Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Plan a future meeting and configure room settings in advance.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
