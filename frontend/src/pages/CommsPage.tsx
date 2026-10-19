import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Radio,
  HardHat,
  CheckCheck,
  Volume2,
} from 'lucide-react';
import { useSafety } from '../context/SafetyContext';

interface Message {
  id: string;
  sender: 'supervisor' | 'worker';
  senderName: string;
  helmetId?: string;
  channel: string;
  text: string;
  timestamp: string;
  status: 'DELIVERED' | 'ACKNOWLEDGED';
}

const initialMessages: Message[] = [
  {
    id: 'm-1',
    sender: 'supervisor',
    senderName: 'Chief Officer (Control Room)',
    channel: 'ALL',
    text: 'Shift 2 commencing. Telemetry active on EMQX cloud broker. Verify HUD status.',
    timestamp: '08:00 AM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'm-2',
    sender: 'worker',
    senderName: 'Arjun Verma',
    helmetId: 'H-201',
    channel: 'H-201',
    text: 'H-201 online in Sector BA. Vitals nominal, MAX30102 pulse optical sync verified.',
    timestamp: '08:02 AM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'm-3',
    sender: 'worker',
    senderName: 'Vikram Patel',
    helmetId: 'H-202',
    channel: 'H-202',
    text: 'H-202 at Level 8 Shaft 3 entrance. Atmospheric sensors calibrated.',
    timestamp: '08:05 AM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'm-4',
    sender: 'supervisor',
    senderName: 'Rajesh Nair (Control Lead)',
    channel: 'H-201',
    text: 'Arjun, keep an eye on combustible gas levels near the north seam.',
    timestamp: '08:14 AM',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'm-5',
    sender: 'worker',
    senderName: 'Arjun Verma',
    helmetId: 'H-201',
    channel: 'H-201',
    text: 'Copy that, sir. MQ-5 reading 142 ppm, well under safety limit.',
    timestamp: '08:15 AM',
    status: 'ACKNOWLEDGED',
  },
];

export const CommsPage: React.FC = () => {
  const { workers } = useSafety();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeChannel, setActiveChannel] = useState<string>('ALL');
  const [inputText, setInputText] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  const channels = [
    { id: 'ALL', name: 'Broadcast (All Helmets)', count: workers.length },
    { id: 'H-201', name: 'H-201 (Arjun Verma)', zone: 'Entrance B' },
    { id: 'H-202', name: 'H-202 (Vikram Patel)', zone: 'Entrance C' },
    { id: 'H-203', name: 'H-203 (Ananya Sharma)', zone: 'Entrance D' },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'supervisor',
      senderName: 'Chief Officer (Control Room)',
      channel: activeChannel,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTransmitting(true);

    // Simulate real worker helmet HUD radio receipt acknowledgment
    setTimeout(() => {
      setIsTransmitting(false);

      const foundWorker = activeChannel === 'ALL'
        ? workers[0]
        : workers.find((w) => w.helmetId === activeChannel);

      const targetName = foundWorker ? foundWorker.name : 'Field Operator';
      const targetHelmet = (foundWorker?.helmetId || activeChannel) as string;
      const targetZone = foundWorker?.assignedZone || 'extraction sector';

      const replies = [
        `Copy that, control room. Message received on helmet HUD. Standing by.`,
        `Understood, lead. Executing instructions now.`,
        `Roger that. Sector telemetry remains nominal.`,
        `Acknowledged from ${targetZone}. Continuing assigned shift task.`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: Message = {
        id: `m-${Date.now() + 1}`,
        sender: 'worker',
        senderName: targetName,
        helmetId: targetHelmet,
        channel: activeChannel,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'ACKNOWLEDGED' as const,
      };

      setMessages((prev) =>
        prev
          .map((m): Message => (m.id === newMsg.id ? { ...m, status: 'ACKNOWLEDGED' as const } : m))
          .concat(replyMsg)
      );
    }, 1200);
  };

  const filteredMessages = messages.filter(
    (m) => activeChannel === 'ALL' || m.channel === 'ALL' || m.channel === activeChannel
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur rounded-[24px] border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Tactical Field Radio &amp; Dispatch Comms
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-way encrypted HUD transmission between Control Room and Smart Helmet Operators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RADIO DISPATCH ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Comms Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Channels List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[24px] border border-slate-200/90 shadow-xs p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Active Radio Channels
          </div>

          <div className="space-y-1.5">
            {channels.map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between border shadow-2xs ${
                    isActive
                      ? 'bg-[#18191B] text-white border-[#18191B]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-white/10 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {ch.id === 'ALL' ? <Volume2 className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs">{ch.name}</div>
                      <div className={`text-[10px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {ch.zone || 'All Active Zones'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Pre-formatted Dispatch Prompts */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Quick Directives
            </div>
            <div className="space-y-1.5 text-xs font-sans">
              <button
                onClick={() => handleSendMessage('Check atmospheric sensor calibrations.')}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 transition text-[11px]"
              >
                💨 Check atmospheric calibrations
              </button>
              <button
                onClick={() => handleSendMessage('Conduct biometrics pulse and SpO2 check.')}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 transition text-[11px]"
              >
                ❤️ Biometrics pulse &amp; SpO2 check
              </button>
              <button
                onClick={() => handleSendMessage('All stations report nominal extraction status.')}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 transition text-[11px]"
              >
                📍 Report extraction status
              </button>
              <button
                onClick={() => handleSendMessage('ALERT: High environmental threshold detected. Verify respirators.')}
                className="w-full text-left p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 transition text-[11px] font-semibold"
              >
                ⚠️ Alert: Verify respirators
              </button>
            </div>
          </div>
        </div>

        {/* Right: Message Stream & Input Box (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[24px] border border-slate-200/90 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Stream Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-sm text-slate-900">
                Channel: {channels.find((c) => c.id === activeChannel)?.name}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredMessages.length} transmissions
            </span>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAFBFD]">
            {filteredMessages.map((msg) => {
              const isLead = msg.sender === 'supervisor';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isLead ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 mb-1 px-1">
                    <span>{msg.senderName}</span>
                    {msg.helmetId && (
                      <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
                        {msg.helmetId}
                      </span>
                    )}
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-[20px] text-xs leading-relaxed shadow-xs ${
                      isLead
                        ? 'bg-[#18191B] text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 mt-0.5 px-1">
                    {msg.status === 'ACKNOWLEDGED' ? (
                      <span className="flex items-center space-x-0.5 text-emerald-600 font-semibold">
                        <CheckCheck className="w-3 h-3" />
                        <span>ACKNOWLEDGED</span>
                      </span>
                    ) : (
                      <span>DELIVERED</span>
                    )}
                  </div>
                </div>
              );
            })}

            {isTransmitting && (
              <div className="flex items-center space-x-2 text-xs text-amber-600 font-mono italic p-2 bg-amber-50 rounded-xl border border-amber-200/60 max-w-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Field helmet transmitting acknowledgment...</span>
              </div>
            )}
          </div>

          {/* Message Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`Send HUD transmission to ${channels.find((c) => c.id === activeChannel)?.name}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs font-sans"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-[#18191B] hover:bg-slate-800 disabled:opacity-40 text-white transition shadow-xs"
              title="Send radio transmission"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
