'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/config/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [field, setField] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', {
        email: field.email,
        password: field.password,
      });
      if (response.status === 200) {
        const result = response.data.data;
        toast.success(response.data.message);
        const { access_token, id } = result;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_id', id);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
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
          <CardTitle className="text-center text-2xl font-semibold">Login Meeting</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="Masukkan email" type="email" value={field.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" placeholder="Masukkan password" type="password" value={field.password} onChange={handleChange} />
            </div>

            <Button type="submit" className="w-full mt-4">
              Login
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Don't Have account ?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register Here
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
