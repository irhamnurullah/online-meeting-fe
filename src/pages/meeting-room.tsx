'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'react-router-dom';

const WEBSOCKET_URL = 'ws://localhost:8080/ws';

export default function MeetingRoom() {
  const { room_code: roomCode } = useParams<{ room_code: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const ws = useRef<WebSocket | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    peerConnection.current = pc;

    const socket = new WebSocket(
      `${WEBSOCKET_URL}?room_code=${roomCode}&user_id=${localStorage.getItem('user_id')}&token=${localStorage.getItem('access_token')}`
    );
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chat') {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.current?.send(JSON.stringify({ type: 'answer', answer }));
      }

      if (data.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }

      if (data.type === 'candidate') {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Error adding ice candidate', err);
        }
      }
    };

    socket.onclose = () => setIsConnected(false);
    socket.onerror = (err) => console.error('WebSocket error:', err);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.current?.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Kirim offer jika ini adalah participant pertama
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.current?.send(JSON.stringify({ type: 'offer', offer }));
      } catch (err) {
        console.error('Media error:', err);
      }
    };

    startMedia();

    return () => {
      pc.close();
      ws.current?.close();
    };
  }, [roomCode]);

  const sendMessage = () => {
    if (ws.current && inputMessage.trim()) {
      const messagePayload = {
        type: 'chat',
        message: `(You): ${inputMessage}`,
      };
      ws.current.send(JSON.stringify(messagePayload));
      setMessages((prev) => [...prev, messagePayload.message]);
      setInputMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <video ref={localVideoRef} autoPlay muted className="w-full h-64 bg-black rounded-lg shadow-md object-cover" />
              <p className="text-sm text-gray-600 mt-2">Kamera Anda</p>
            </div>
            <div>
              <video ref={remoteVideoRef} autoPlay className="w-full h-64 bg-black rounded-lg shadow-md object-cover" />
              <p className="text-sm text-gray-600 mt-2">Peserta Lain</p>
            </div>
          </div>

          <div className="flex flex-col h-64 border rounded-lg p-3 overflow-y-auto text-sm text-gray-700 bg-gray-50">
            {messages.length === 0 ? <p className="text-gray-400 italic">Belum ada pesan.</p> : messages.map((msg, i) => <p key={i}>{msg}</p>)}
          </div>

          <div className="space-y-2">
            <Textarea placeholder="Tulis pesan Anda..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
            <Button onClick={sendMessage} disabled={!isConnected || inputMessage.trim() === ''}>
              Kirim
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
