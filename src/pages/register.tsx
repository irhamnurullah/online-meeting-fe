'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/config/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [field, setField] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/register', field);
      if (response.status === 200) {
        toast.success('Success Register, please login');
        navigate('/login');
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Register Meeting</CardTitle>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Name</Label>
              <Input id="name" name="name" placeholder="Masukkan name" value={field.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="Masukkan email" value={field.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" placeholder="Masukkan password" type="password" value={field.password} onChange={handleChange} />
            </div>

            <Button type="submit" className="w-full mt-4">
              Register
            </Button>

            <p className="text-sm text-gray-500 mt-2">
              Have account ?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login Here
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
