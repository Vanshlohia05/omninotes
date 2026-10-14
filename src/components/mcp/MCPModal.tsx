import React, { useState } from 'react';
import { X, Bot, Play, Check, Copy, Code, Terminal } from 'lucide-react';
import { MCPServerEngine, MCP_TOOLS } from '../../services/mcpServer';

interface MCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcpEngine: MCPServerEngine;
}

export const MCPModal: React.FC<MCPModalProps> = ({ isOpen, onClose, mcpEngine }) => {
  const [selectedTool, setSelectedTool] = useState(MCP_TOOLS[0].name);
  const [inputArgs, setInputArgs] = useState('{}');
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const currentDef = MCP_TOOLS.find((t) => t.name === selectedTool) || MCP_TOOLS[0];

  const handleSelectTool = (name: string) => {
    setSelectedTool(name);
    if (name === 'list_folders') {
      setInputArgs('{}');
    } else if (name === 'search_notes') {
      setInputArgs('{\n  "query": "welcome"\n}');
    } else if (name === 'read_note') {
      setInputArgs('{\n  "title": "Welcome to OmniNotes ✨"\n}');
    } else if (name === 'create_note') {
      setInputArgs('{\n  "title": "Agent Research Note",\n  "tags": ["ai", "mcp"],\n  "content": "# Research Findings\\n- Analyzed user data\\n- Verified with tests"\n}');
    } else if (name === 'update_note') {
      setInputArgs('{\n  "noteId": "note-welcome",\n  "appendMarkdown": "Added via MCP Tool"\n}');
    } else if (name === 'query_canvas') {
      setInputArgs('{\n  "noteId": "note-mindmap"\n}');
    }
    setOutputResult(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const parsedArgs = JSON.parse(inputArgs);
      const res = await mcpEngine.executeTool(selectedTool, parsedArgs);
      setOutputResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setOutputResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        omninotes: {
          command: "node",
          args: ["./omninotes-mcp-bridge.js"],
          env: {
            OMNINOTES_PORT: "5173"
          }
        }
      }
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfigSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#252525] p-6 shadow-apple-floating border border-black/10 dark:border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
            <Bot className="w-5 h-5 text-indigo-500" />
            Model Context Protocol (MCP) Inspector
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin text-xs">
          <p className="text-slate-500 leading-relaxed">
            OmniNotes exposes an integrated Model Context Protocol (MCP) tool engine. External AI assistants (Antigravity, Claude, Copilot) can query, search, read, and write notes in your vault.
          </p>

          {/* Tools Grid */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Available MCP Tools
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {MCP_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool.name)}
                  className={`p-2 rounded-xl text-left transition border ${
                    selectedTool === tool.name
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold shadow-sm'
                      : 'border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="font-mono text-[11px] truncate">{tool.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{tool.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tool Parameters & Execution Playground */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                Input Arguments (JSON)
              </span>
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                {isLoading ? 'Executing...' : 'Run Tool'}
              </button>
            </div>

            <textarea
              rows={4}
              value={inputArgs}
              onChange={(e) => setInputArgs(e.target.value)}
              className="w-full font-mono text-xs p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />

            {/* Execution Result */}
            {outputResult && (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Result
                </div>
                <pre className="p-2.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 scrollbar-thin">
                  {outputResult}
                </pre>
              </div>
            )}
          </div>

          {/* Claude Desktop / Antigravity config snippet */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-amber-500" />
                MCP Client Configuration (Claude / Antigravity)
              </span>
              <button
                onClick={copyConfig}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-600 transition"
              >
                {copiedConfig ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedConfig ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-2 rounded bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
              {mcpConfigSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-neutral-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
