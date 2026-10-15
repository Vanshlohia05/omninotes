import React, { useState } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  Cpu,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ApiServer } from '../../services/apiServer';
import { OPENAPI_SPEC } from '../../services/openapiSpec';

interface APIExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiServer: ApiServer;
}

interface EndpointPreset {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
}

const ENDPOINT_PRESETS: EndpointPreset[] = [
  {
    name: 'List All Notes (GET /notes)',
    method: 'GET',
    path: '/notes'
  },
  {
    name: 'Search Notes (GET /notes?search=welcome)',
    method: 'GET',
    path: '/notes?search=welcome'
  },
  {
    name: 'Create Note with Markdown (POST /notes)',
    method: 'POST',
    path: '/notes',
    body: {
      title: 'Created by AI Assistant 🤖',
      content: '# AI Generated Note\n- [x] Initial sync completed\n- [ ] Review quarterly targets\n\n> Seamless agent integration.',
      tags: ['ai', 'agent', 'automation']
    }
  },
  {
    name: 'List Notebooks (GET /notebooks)',
    method: 'GET',
    path: '/notebooks'
  },
  {
    name: 'Create Notebook Binder (POST /notebooks)',
    method: 'POST',
    path: '/notebooks',
    body: {
      name: 'Artificial Intelligence & Neural Nets',
      color: '#7719AA',
      icon: '🧠'
    }
  },
  {
    name: 'List Units in Notebook (GET /notebooks/nb-cs/units)',
    method: 'GET',
    path: '/notebooks/nb-cs/units'
  },
  {
    name: 'Create Unit in Notebook (POST /notebooks/nb-cs/units)',
    method: 'POST',
    path: '/notebooks/nb-cs/units',
    body: {
      name: 'Unit 3: Deep Reinforcement Learning'
    }
  },
  {
    name: 'Create Section Tab in Unit (POST /notebooks/nb-cs/units/unit-cs-1/chapters)',
    method: 'POST',
    path: '/notebooks/nb-cs/units/unit-cs-1/chapters',
    body: {
      name: 'Q-Learning & Policy Gradients',
      color: '#038387'
    }
  },
  {
    name: 'Create Page in Chapter (POST /notebooks/nb-cs/chapters/chap-arrays/pages)',
    method: 'POST',
    path: '/notebooks/nb-cs/chapters/chap-arrays/pages',
    body: {
      title: 'Dynamic Arrays & Amortized Analysis',
      markdown: '# Dynamic Arrays\n- Double capacity upon overflow\n- Amortized O(1) push operations\n- [x] Verified by AI agent'
    }
  },
  {
    name: 'Get OpenAPI Schema (GET /openapi.json)',
    method: 'GET',
    path: '/openapi.json'
  }
];

export const APIExplorerModal: React.FC<APIExplorerModalProps> = ({
  isOpen,
  onClose,
  apiServer
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'chatgpt' | 'schema'>('console');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [requestPath, setRequestPath] = useState('/notes');
  const [requestBodyText, setRequestBodyText] = useState('');
  const [responseData, setResponseData] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedMethod(preset.method);
    setRequestPath(preset.path);
    setRequestBodyText(preset.body ? JSON.stringify(preset.body, null, 2) : '');
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      let parsedBody: any = null;
      if (['POST', 'PUT'].includes(selectedMethod) && requestBodyText.trim()) {
        parsedBody = JSON.parse(requestBodyText);
      }

      // Parse query params if any
      const [pathOnly, queryString] = requestPath.split('?');
      const query: Record<string, string> = {};
      if (queryString) {
        new URLSearchParams(queryString).forEach((val, key) => {
          query[key] = val;
        });
      }

      const res = await apiServer.handleRequest(selectedMethod, pathOnly, parsedBody, query);
      const elapsed = Math.round(performance.now() - start);

      setResponseStatus(res.status);
      setResponseData(res.data || { error: res.error });
      setResponseTimeMs(elapsed);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message || 'Invalid Request' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(identifier);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const downloadOpenApiJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(OPENAPI_SPEC, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'omninotes-openapi.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const generateCurlCommand = () => {
    const fullUrl = `https://omninotes.local/api${requestPath.startsWith('/') ? requestPath : '/' + requestPath}`;
    if (['POST', 'PUT'].includes(selectedMethod) && requestBodyText.trim()) {
      return `curl -X ${selectedMethod} "${fullUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBodyText.replace(/\n/g, '')}'`;
    }
    return `curl -X ${selectedMethod} "${fullUrl}"`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  OmniNotes AI Integration & OpenAPI 3.1
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300/40">
                  OpenAPI 3.1 Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plug-and-play REST API for ChatGPT Custom GPT Actions, Claude Desktop, Antigravity, and AI Agents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-black/10 dark:border-white/10 px-6 bg-white dark:bg-[#1E1E1E]">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'console'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Interactive Test Console</span>
          </button>
          <button
            onClick={() => setActiveTab('chatgpt')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'chatgpt'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>ChatGPT Custom Actions Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>OpenAPI Schema Viewer</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB 1: INTERACTIVE CONSOLE */}
          {activeTab === 'console' && (
            <div className="space-y-4">
              {/* Presets Quick Pick */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Endpoint Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {ENDPOINT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 transition border border-black/5 dark:border-white/5 font-medium"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Request URL bar */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-neutral-800 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <div className="relative flex-1 flex items-center">
                  <span className="absolute left-3 text-xs text-slate-400 font-mono select-none">/api</span>
                  <input
                    type="text"
                    value={requestPath}
                    onChange={(e) => setRequestPath(e.target.value)}
                    placeholder="/notes"
                    className="w-full pl-12 pr-3 py-2 text-xs font-mono rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleSendRequest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {/* Request Body (For POST/PUT) */}
              {['POST', 'PUT'].includes(selectedMethod) && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Request Body (JSON)
                  </label>
                  <textarea
                    rows={4}
                    value={requestBodyText}
                    onChange={(e) => setRequestBodyText(e.target.value)}
                    placeholder='{ "title": "My Note", "content": "# Markdown content" }'
                    className="w-full p-3 font-mono text-xs rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Response Panel */}
              {responseStatus !== null && (
                <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Response:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          responseStatus >= 200 && responseStatus < 300
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {responseStatus} OK
                      </span>
                      {responseTimeMs !== null && (
                        <span className="text-[11px] text-slate-400 font-mono">{responseTimeMs} ms</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(generateCurlCommand(), 'curl')}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        {copiedSnippet === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy cURL</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(responseData, null, 2), 'response')}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        {copiedSnippet === 'response' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Response</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-60 border border-black/20">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHATGPT & AI AGENTS GUIDE */}
          {activeTab === 'chatgpt' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Connect ChatGPT Custom Actions in 3 Steps
                </h3>
                <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                  You can give ChatGPT, Claude, Antigravity, or any custom LLM full access to create, edit, search, and manage your notes and OneNote binders.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Open GPT Editor in ChatGPT</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Navigate to <strong>Explore GPTs</strong> → <strong>Create</strong> → <strong>Configure</strong> → scroll down to <strong>Actions</strong> and click <strong>Create new action</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Paste the OpenAPI 3.1 Schema</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Click the button below to copy the complete OpenAPI 3.1 JSON schema and paste it directly into the "Schema" box in ChatGPT Actions.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(OPENAPI_SPEC, null, 2), 'spec-full')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                      >
                        {copiedSnippet === 'spec-full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy OpenAPI 3.1 Schema</span>
                      </button>
                      <button
                        onClick={downloadOpenApiJson}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download openapi.json</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Ask ChatGPT or AI Agent Anything!</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Sample commands you can type in ChatGPT:
                    </p>
                    <ul className="list-disc list-inside mt-1 text-slate-600 dark:text-slate-400 space-y-1 font-mono text-[11px]">
                      <li>"List all my chapters in the Computer Science notebook"</li>
                      <li>"Create a new note summarizing today's meeting with #ai tags"</li>
                      <li>"Append an algorithm explanation to the Arrays & Lists chapter"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA VIEWER */}
          {activeTab === 'schema' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">OpenAPI 3.1.0 JSON Schema</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(OPENAPI_SPEC, null, 2), 'spec-tab')}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  {copiedSnippet === 'spec-tab' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Full Schema</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] border border-black/20">
                {JSON.stringify(OPENAPI_SPEC, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
