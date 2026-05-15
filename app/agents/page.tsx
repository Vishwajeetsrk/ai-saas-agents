'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCreditsStore } from '@/lib/store';
import { AGENT_CONFIGS } from '@/lib/agents/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type AgentType = keyof typeof AGENT_CONFIGS;

interface UsageLog {
  id: string;
  agent_type: string;
  credits_used: number;
  status: string;
  created_at: string;
}

export default function AgentsPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const { getAvailableCredits, deductCredits } = useCreditsStore();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUsageLogs(user.id);
      }
    };
    fetchUser();
  }, [supabase]);

  const fetchUsageLogs = async (uid: string) => {
    const { data } = await supabase
      .from('agent_usage')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10);
    setUsageLogs(data || []);
  };

  const handleAgentRequest = async () => {
    if (!selectedAgent || !input.trim()) {
      setError('Please select an agent and enter input');
      return;
    }

    const agent = AGENT_CONFIGS[selectedAgent];
    const available = getAvailableCredits();

    if (available < agent.creditsRequired) {
      setError(`Insufficient credits. Need ${agent.creditsRequired}, have ${available}`);
      return;
    }

    setIsLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: selectedAgent,
          input,
          userId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Agent request failed');
      } else {
        setOutput(data.output);
        deductCredits(data.creditsUsed);
        await fetchUsageLogs(userId);
      }
    } catch (err) {
      setError('Failed to process request');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white border-l-4 border-white">
      {/* Header */}
      <div className="border-b-4 border-white p-6 flex items-center gap-4">
        <Link href="/dashboard" className="hover:opacity-70 transition">
          <ChevronLeft size={32} />
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-wider">Agent Playground</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Agent Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border-4 border-white p-4 bg-gray-900">
            <h2 className="text-xl font-black uppercase mb-4">Select Agent</h2>
            <div className="space-y-2">
              {Object.entries(AGENT_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedAgent(key as AgentType)}
                  className={`w-full px-4 py-3 font-bold text-left uppercase transition border-2 ${
                    selectedAgent === key
                      ? 'bg-white text-black border-white'
                      : 'bg-gray-800 text-white border-gray-700 hover:border-white'
                  }`}
                >
                  <div className="font-black text-sm">{config.name}</div>
                  <div className="text-xs text-gray-400">{config.creditsRequired} credits</div>
                </button>
              ))}
            </div>
          </div>

          {/* Usage History */}
          <div className="border-4 border-white p-4 bg-gray-900">
            <h2 className="text-xl font-black uppercase mb-4">Recent Usage</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {usageLogs.map((log) => (
                <div key={log.id} className="border-l-4 border-gray-600 pl-3 py-2 text-xs">
                  <div className="font-bold uppercase">{log.agent_type}</div>
                  <div className="text-gray-400">
                    -{log.credits_used} credits • {new Date(log.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Playground */}
        <div className="lg:col-span-2 border-4 border-white p-6 bg-gray-900">
          <h2 className="text-2xl font-black uppercase mb-4">
            {selectedAgent ? AGENT_CONFIGS[selectedAgent].name : 'Select an agent'}
          </h2>

          {selectedAgent && (
            <p className="text-gray-400 text-sm mb-4">
              {AGENT_CONFIGS[selectedAgent].description}
            </p>
          )}

          <div className="space-y-4">
            {/* Input */}
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your code or describe your request..."
                className="w-full h-32 bg-black border-2 border-white p-4 text-white font-mono text-sm focus:outline-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="border-l-4 border-red-500 bg-red-950 p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Output */}
            {output && (
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Output</label>
                <div className="bg-black border-2 border-white p-4 h-48 overflow-y-auto font-mono text-sm text-green-400 whitespace-pre-wrap">
                  {output}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAgentRequest}
              disabled={!selectedAgent || isLoading}
              className="w-full px-6 py-4 bg-white text-black font-bold uppercase hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition border-2 border-white text-lg"
            >
              {isLoading ? 'Processing...' : `Execute Agent (-${selectedAgent ? AGENT_CONFIGS[selectedAgent].creditsRequired : 0} credits)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
