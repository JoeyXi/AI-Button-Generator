import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Settings, 
  MessageCircle, 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Code, 
  Bot, 
  Send, 
  Check, 
  Copy,
  Sparkles,
  AlertCircle,
  Zap,
  Cpu,
  Brain,
  Shield,
  Server,
  Globe,
  Lock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

type AIProvider = 'gemini' | 'openai' | 'anthropic';
type ConnectionMode = 'direct' | 'proxy';

interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  endpoint: string;
  apiKey: string;
  modelParam: string;
  connectionMode: ConnectionMode;
}

interface ButtonStyle {
  label: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string; // '0px', '8px', '24px', '9999px'
  position: 'bottom-right' | 'bottom-left';
  icon: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelPreset {
  name: string;
  provider: AIProvider;
  model: string;
  endpoint: string;
  description: string;
  tag?: string;
}

// --- Constants ---

const MODEL_PRESETS: ModelPreset[] = [
  { 
    name: 'Gemini 2.5 Flash', 
    provider: 'gemini', 
    model: 'gemini-2.5-flash', 
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Fast, multimodal, low latency.',
    tag: 'Recommended'
  },
  { 
    name: 'Gemini 1.5 Pro', 
    provider: 'gemini', 
    model: 'gemini-1.5-pro', 
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Complex reasoning, larger context.' 
  },
  { 
    name: 'GPT-4o', 
    provider: 'openai', 
    model: 'gpt-4o', 
    endpoint: 'https://api.openai.com/v1/chat/completions',
    description: 'OpenAI flagship model.' 
  },
  { 
    name: 'GPT-4o Mini', 
    provider: 'openai', 
    model: 'gpt-4o-mini', 
    endpoint: 'https://api.openai.com/v1/chat/completions',
    description: 'Cost-effective, fast.' 
  },
  { 
    name: 'DeepSeek V3', 
    provider: 'openai', 
    model: 'deepseek-chat', 
    endpoint: 'https://api.deepseek.com',
    description: 'Top-tier open model performance.',
    tag: 'Popular'
  },
  { 
    name: 'DeepSeek R1', 
    provider: 'openai', 
    model: 'deepseek-reasoner', 
    endpoint: 'https://api.deepseek.com',
    description: 'Advanced reasoning capabilities.' 
  },
  { 
    name: 'Claude 3.5 Sonnet', 
    provider: 'anthropic', 
    model: 'claude-3-5-sonnet-20241022', 
    endpoint: 'https://api.anthropic.com/v1/messages',
    description: 'Exceptional coding and nuance.' 
  },
  { 
    name: 'Groq (Llama 3 70B)', 
    provider: 'openai', 
    model: 'llama3-70b-8192', 
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    description: 'Extremely fast inference.' 
  },
  { 
    name: 'OpenRouter (Qwen 2.5)', 
    provider: 'openai', 
    model: 'qwen/qwen-2.5-72b-instruct', 
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    description: 'Strong open-source model.' 
  }
];

const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'default-gemini',
    name: 'Gemini Flash (System)',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.API_KEY || '',
    modelParam: 'gemini-2.5-flash',
    connectionMode: 'direct'
  }
];

const DEFAULT_STYLE: ButtonStyle = {
  label: 'Ask AI',
  backgroundColor: '#4F46E5', // Indigo 600
  textColor: '#FFFFFF',
  borderRadius: '9999px',
  position: 'bottom-right',
  icon: 'message',
};

// --- Components ---

function App() {
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODELS[0].id);
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(DEFAULT_STYLE);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Derived state
  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  const handleAddModel = (newModel: AIModel) => {
    setModels([...models, newModel]);
    setSelectedModelId(newModel.id);
  };

  const handleUpdateModel = (updatedModel: AIModel) => {
    setModels(models.map(m => m.id === updatedModel.id ? updatedModel : m));
  };

  const handleDeleteModel = (id: string) => {
    const newModels = models.filter(m => m.id !== id);
    setModels(newModels);
    if (selectedModelId === id && newModels.length > 0) {
      setSelectedModelId(newModels[0].id);
    } else if (newModels.length === 0) {
      setSelectedModelId('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Button Generator</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Create custom AI support widgets for any site</p>
          </div>
        </div>
        <button
          onClick={() => setShowCodeModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-md"
        >
          <Code size={18} />
          <span className="hidden sm:inline">Get Code</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Configuration Panel */}
        <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 overflow-y-auto p-6 flex flex-col gap-8 shadow-sm z-0">
          
          {/* Section: AI Model */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                AI Configuration
              </h2>
              <button 
                onClick={() => setIsModelManagerOpen(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
              >
                Manage Models
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Model</label>
                <div className="relative">
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              
              {selectedModel && (
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Connection Mode</span>
                    {selectedModel.connectionMode === 'proxy' ? (
                       <span className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide">
                          <Lock size={10} /> SECURE PROXY
                       </span>
                    ) : (
                       <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide">
                          <Globe size={10} /> DIRECT API
                       </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Provider</span>
                    <span className="uppercase bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] tracking-wide">{selectedModel.provider}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700 block mb-1">Target Endpoint</span>
                    <span className="font-mono bg-white px-1.5 py-1 rounded border border-gray-200 break-all block text-[10px] leading-relaxed">
                      {selectedModel.endpoint}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section: Appearance */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings size={16} className="text-indigo-600" />
              Appearance
            </h2>
            
            <div className="space-y-5">
              {/* Label Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
                <input
                  type="text"
                  value={buttonStyle.label}
                  onChange={(e) => setButtonStyle({...buttonStyle, label: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Ask AI"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                  <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-lg">
                    <input
                      type="color"
                      value={buttonStyle.backgroundColor}
                      onChange={(e) => setButtonStyle({...buttonStyle, backgroundColor: e.target.value})}
                      className="h-8 w-8 p-0 rounded border-none cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-500">{buttonStyle.backgroundColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-lg">
                    <input
                      type="color"
                      value={buttonStyle.textColor}
                      onChange={(e) => setButtonStyle({...buttonStyle, textColor: e.target.value})}
                      className="h-8 w-8 p-0 rounded border-none cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-500">{buttonStyle.textColor}</span>
                  </div>
                </div>
              </div>

              {/* Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Square', value: '0px' },
                    { label: 'Small', value: '8px' },
                    { label: 'Large', value: '24px' },
                    { label: 'Pill', value: '9999px' },
                  ].map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => setButtonStyle({...buttonStyle, borderRadius: shape.value})}
                      className={`py-2 text-xs font-medium border rounded-lg transition-all ${
                        buttonStyle.borderRadius === shape.value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setButtonStyle({...buttonStyle, position: 'bottom-left'})}
                    className={`py-2 text-xs font-medium border rounded-lg transition-all ${
                      buttonStyle.position === 'bottom-left'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Bottom Left
                  </button>
                  <button
                    onClick={() => setButtonStyle({...buttonStyle, position: 'bottom-right'})}
                    className={`py-2 text-xs font-medium border rounded-lg transition-all ${
                      buttonStyle.position === 'bottom-right'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Bottom Right
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-100 relative p-4 lg:p-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
            </div>
            
            <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col relative transform transition-all">
              {/* Mock Browser Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-md py-1 px-3 text-xs text-gray-400 font-mono text-center shadow-sm">
                  your-website.com
                </div>
              </div>

              {/* Mock Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-8 opacity-50">
                  <div className="h-12 w-3/4 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-12">
                     <div className="h-40 bg-gray-100 rounded-lg border border-gray-200"></div>
                     <div className="h-40 bg-gray-100 rounded-lg border border-gray-200"></div>
                  </div>
                </div>
              </div>

              {/* THE LIVE PREVIEW WIDGET */}
              {selectedModel && (
                <LivePreviewWidget 
                  style={buttonStyle} 
                  model={selectedModel} 
                />
              )}
            </div>
        </div>
      </main>

      {/* Modals */}
      {isModelManagerOpen && (
        <ModelManagerModal 
          models={models} 
          onAdd={handleAddModel} 
          onUpdate={handleUpdateModel}
          onDelete={handleDeleteModel}
          onClose={() => setIsModelManagerOpen(false)} 
        />
      )}

      {showCodeModal && selectedModel && (
        <CodeExportModal 
          style={buttonStyle} 
          model={selectedModel} 
          onClose={() => setShowCodeModal(false)} 
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function LivePreviewWidget({ style, model }: { style: ButtonStyle, model: AIModel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset conversation when model changes
    setMessages([{ role: 'assistant', content: `Hello! I'm powered by ${model.name}. How can I help you today?` }]);
    setIsOpen(false);
  }, [model.id, model.name]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      let responseText = "I'm sorry, I couldn't process that.";

      if (model.provider === 'gemini' && model.id === 'default-gemini') {
         // Use real Gemini API for default demo
         const ai = new GoogleGenAI({ apiKey: model.apiKey });
         const response = await ai.models.generateContent({
            model: model.modelParam || 'gemini-2.5-flash',
            contents: userMsg.content,
         });
         responseText = response.text || "No response text.";
      } else {
         // For custom endpoints or proxies, we simulate in preview to avoid CORS errors unless it's a real proxy
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         if (model.connectionMode === 'proxy') {
             responseText = `[Proxy Simulation]
             
I would have sent this JSON payload to your server at: 
${model.endpoint}

{
  "messages": [
    { "role": "user", "content": "${userMsg.content}" }
  ]
}

Since this is a preview, I'm just echoing back.`;
         } else {
             responseText = `[Direct API Simulation]
         
I received your message: "${userMsg.content}".

Since I am running in a preview sandbox, I cannot make cross-origin requests to:
${model.endpoint}

However, the generated code you copy will work perfectly on your live site if the API supports it!`;
         }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`absolute z-50 flex flex-col items-end gap-4 transition-all duration-300 ${
      style.position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'
    }`}>
      
      {/* Chat Window */}
      <div className={`
        origin-bottom-${style.position === 'bottom-right' ? 'right' : 'left'}
        transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
        w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden
      `}>
        {/* Chat Header */}
        <div 
          className="p-4 flex items-center justify-between text-white shadow-sm"
          style={{ backgroundColor: style.backgroundColor }}
        >
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">{style.label || 'Support'}</span>
              <span className="text-[10px] opacity-80 leading-tight">{model.name}</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}
                style={msg.role === 'user' ? { backgroundColor: style.backgroundColor } : {}}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center h-10">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full pl-4 pr-10 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ '--tw-ring-color': style.backgroundColor } as any}
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: style.backgroundColor }}
              disabled={!inputValue.trim()}
            >
              <Send size={14} />
            </button>
          </div>
          <div className="text-center mt-2 flex items-center justify-center gap-1 opacity-40">
            {model.connectionMode === 'proxy' ? <Lock size={10} className="text-green-600"/> : <Settings size={10} />}
            <span className="text-[10px] font-medium">Powered by {model.provider}</span>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          borderRadius: style.borderRadius,
        }}
      >
        <div className="relative">
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </div>
        {style.label && <span className="font-semibold">{style.label}</span>}
      </button>
    </div>
  );
}

function ModelManagerModal({ 
  models, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onClose 
}: { 
  models: AIModel[], 
  onAdd: (m: AIModel) => void, 
  onUpdate: (m: AIModel) => void, 
  onDelete: (id: string) => void, 
  onClose: () => void 
}) {
  const [view, setView] = useState<'list' | 'edit' | 'presets'>('list');
  const [editingModel, setEditingModel] = useState<Partial<AIModel>>({});
  
  const handleSave = () => {
    if (!editingModel.name) return;
    if (editingModel.connectionMode === 'direct' && !editingModel.apiKey) return;
    if (editingModel.connectionMode === 'proxy' && !editingModel.endpoint) return;
    
    // Simple endpoint clean up
    let cleanEndpoint = editingModel.endpoint?.trim() || '';
    if (cleanEndpoint.endsWith('/')) {
      cleanEndpoint = cleanEndpoint.slice(0, -1);
    }

    // Defaults if missing for direct mode
    if (editingModel.connectionMode === 'direct' && !cleanEndpoint) {
        if (editingModel.provider === 'gemini') cleanEndpoint = 'https://generativelanguage.googleapis.com/v1beta';
        else if (editingModel.provider === 'anthropic') cleanEndpoint = 'https://api.anthropic.com/v1/messages';
        else cleanEndpoint = 'https://api.openai.com/v1/chat/completions';
    }

    const modelToSave: AIModel = {
      id: editingModel.id || crypto.randomUUID(),
      name: editingModel.name,
      provider: editingModel.provider || 'openai',
      endpoint: cleanEndpoint,
      apiKey: editingModel.apiKey || '', // Can be empty if proxy
      modelParam: editingModel.modelParam || (editingModel.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-3.5-turbo'),
      connectionMode: editingModel.connectionMode || 'direct'
    };

    if (editingModel.id) {
      onUpdate(modelToSave);
    } else {
      onAdd(modelToSave);
    }
    setView('list');
    setEditingModel({});
  };

  const startEdit = (model: AIModel) => {
    setEditingModel(model);
    setView('edit');
  };

  const startNew = () => {
    setView('presets');
  };

  const selectPreset = (preset: ModelPreset) => {
      setEditingModel({
          name: preset.name,
          provider: preset.provider,
          endpoint: preset.endpoint,
          modelParam: preset.model,
          connectionMode: 'direct'
      });
      setView('edit');
  };

  const startCustom = () => {
    setEditingModel({
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      modelParam: 'gpt-4o',
      connectionMode: 'direct'
    });
    setView('edit');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            {view !== 'list' && (
                <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-900 transition-colors mr-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
            )}
            <h3 className="font-bold text-gray-900">
                {view === 'list' ? 'Manage AI Models' : view === 'presets' ? 'Select a Model Preset' : 'Configure Model'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {view === 'list' ? (
            <div className="space-y-4">
              {models.map(model => (
                <div key={model.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all group bg-white">
                  <div className="flex-1 min-w-0 pr-4">
                     <div className="flex items-center gap-2 mb-1">
                       <h4 className="font-semibold text-gray-900 truncate">{model.name}</h4>
                       {model.connectionMode === 'proxy' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Lock size={8}/> PROXY</span>}
                       {model.id === 'default-gemini' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">System</span>}
                     </div>
                     <div className="flex items-center gap-3 text-xs text-gray-500">
                       <span className="uppercase bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-medium">{model.provider}</span>
                       <span className="font-mono truncate opacity-70">{model.modelParam}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(model)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    {model.id !== 'default-gemini' && (
                      <button onClick={() => onDelete(model.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button 
                onClick={startNew}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={18} />
                Add New Model
              </button>
            </div>
          ) : view === 'presets' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODEL_PRESETS.map((preset, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectPreset(preset)}
                        className="flex flex-col text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group relative overflow-hidden"
                      >
                          {preset.tag && (
                              <span className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                  {preset.tag}
                              </span>
                          )}
                          <div className="flex items-center justify-between w-full mb-2">
                              <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{preset.name}</span>
                              {preset.provider === 'gemini' && <Sparkles size={16} className="text-blue-500"/>}
                              {preset.provider === 'openai' && <Zap size={16} className="text-green-500"/>}
                              {preset.provider === 'anthropic' && <Brain size={16} className="text-orange-500"/>}
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{preset.description}</p>
                          <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                              <span className="uppercase bg-gray-100 px-1 rounded">{preset.provider}</span>
                              <span className="truncate">{preset.model}</span>
                          </div>
                      </button>
                  ))}
                  <button 
                    onClick={startCustom}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-all"
                  >
                      <Settings size={24} className="mb-2 opacity-50"/>
                      <span className="font-medium text-sm">Custom Configuration</span>
                  </button>
              </div>
          ) : (
            <div className="space-y-5 bg-white p-1 rounded-lg">
              {/* Common Fields */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Friendly Name</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingModel.name || ''}
                  onChange={e => setEditingModel({...editingModel, name: e.target.value})}
                  placeholder="e.g. My GPT-4"
                />
              </div>

              {/* Mode Toggle */}
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Security & Connection</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                      <button 
                        onClick={() => setEditingModel({...editingModel, connectionMode: 'direct'})}
                        className={`py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                            (editingModel.connectionMode || 'direct') === 'direct' 
                            ? 'bg-white text-indigo-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                          <Globe size={14} /> Direct API
                      </button>
                      <button 
                         onClick={() => setEditingModel({...editingModel, connectionMode: 'proxy', endpoint: ''})} // Clear endpoint when switching to proxy as defaults differ
                         className={`py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                            editingModel.connectionMode === 'proxy' 
                            ? 'bg-white text-green-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                         }`}
                      >
                          <Lock size={14} /> Backend Proxy
                      </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2 px-1">
                      {editingModel.connectionMode === 'proxy' 
                        ? 'Secure mode. The widget sends messages to your server, which then calls the AI provider. No API keys are exposed.' 
                        : 'Test mode. The widget connects directly to the AI provider. Your API key will be visible in the browser source code.'}
                  </p>
              </div>

              {/* Provider & Model Param */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Provider Protocol</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={editingModel.provider || 'openai'}
                    onChange={e => setEditingModel({
                        ...editingModel, 
                        provider: e.target.value as any,
                        // Reset defaults when switching provider ONLY if Direct mode
                        endpoint: editingModel.connectionMode === 'direct' ? (
                            e.target.value === 'gemini' 
                            ? 'https://generativelanguage.googleapis.com/v1beta' 
                            : e.target.value === 'anthropic' 
                                ? 'https://api.anthropic.com/v1/messages'
                                : 'https://api.openai.com/v1/chat/completions'
                        ) : editingModel.endpoint,
                        modelParam: e.target.value === 'gemini' ? 'gemini-2.5-flash' : (e.target.value === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o')
                    })}
                  >
                    <option value="openai">OpenAI / Compatible</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Model Param</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingModel.modelParam || ''}
                    onChange={e => setEditingModel({...editingModel, modelParam: e.target.value})}
                    placeholder="e.g. gpt-4"
                  />
                </div>
              </div>
              
              {/* Endpoint & Key Logic based on Mode */}
              {editingModel.connectionMode === 'proxy' ? (
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-green-800 uppercase mb-1.5">Your Proxy URL</label>
                        <input 
                            className="w-full p-3 border border-green-200 rounded-lg text-sm font-mono text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                            value={editingModel.endpoint || ''}
                            onChange={e => setEditingModel({...editingModel, endpoint: e.target.value})}
                            placeholder="https://your-server.com/api/chat"
                        />
                      </div>
                      <div className="text-[11px] text-green-800 bg-white p-3 rounded border border-green-100 font-mono overflow-x-auto">
                          <div className="font-bold mb-1 opacity-70">Frontend will send this JSON:</div>
                          {`{ "messages": [{ "role": "user", "content": "..." }] }`}
                      </div>
                  </div>
              ) : (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">API Endpoint</label>
                        <input 
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editingModel.endpoint || ''}
                        onChange={e => setEditingModel({...editingModel, endpoint: e.target.value})}
                        placeholder="https://..."
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">API Key</label>
                        <div className="relative">
                            <input 
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none bg-amber-50 border-amber-200"
                            value={editingModel.apiKey || ''}
                            onChange={e => setEditingModel({...editingModel, apiKey: e.target.value})}
                            placeholder="sk-..."
                            />
                        </div>
                        <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} />
                        Warning: This key will be exposed in the frontend code.
                        </p>
                     </div>
                  </div>
              )}

              <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
                <button 
                  onClick={() => setView('list')}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeExportModal({ style, model, onClose }: { style: ButtonStyle, model: AIModel, onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  // Generate the actual JS code snippet
  const generateSnippet = () => {
    const safeStyle = JSON.stringify(style);
    
    // Logic to determine what to expose in the config
    const safeModelConfig: any = {
       provider: model.provider,
       endpoint: model.endpoint,
       modelParam: model.modelParam,
       name: model.name,
       connectionMode: model.connectionMode
    };

    // ONLY include API key if in Direct mode
    if (model.connectionMode === 'direct') {
        safeModelConfig.apiKey = model.apiKey;
    }

    const safeModel = JSON.stringify(safeModelConfig);

    return `<!-- AI Button Widget Code -->
<script>
(function() {
  const config = {
    style: ${safeStyle},
    model: ${safeModel}
  };

  // 1. Create container
  const container = document.createElement('div');
  container.id = 'ai-widget-root';
  Object.assign(container.style, {
    position: 'fixed',
    zIndex: '9999',
    bottom: '24px',
    [config.style.position === 'bottom-right' ? 'right' : 'left']: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  });
  document.body.appendChild(container);

  // 2. Create Chat Window
  const chatWindow = document.createElement('div');
  Object.assign(chatWindow.style, {
    display: 'none',
    width: '360px',
    height: '520px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    flexDirection: 'column',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '1px solid #e5e7eb',
    position: 'absolute',
    bottom: '60px',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'all 0.2s ease-out',
    [config.style.position === 'bottom-right' ? 'right' : 'left']: '0',
  });
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = \`padding: 16px; background-color: \${config.style.backgroundColor}; color: #fff; display: flex; justify-content: space-between; align-items: center;\`;
  header.innerHTML = \`
    <div style="display:flex; align-items:center; gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M4 8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l4-4h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H4z"/></svg>
        <span style="font-weight:600; font-size:15px;">\${config.model.name}</span>
    </div>
    <button id="ai-close-btn" style="background:none; border:none; color:white; cursor:pointer; padding:4px; display:flex; opacity:0.8;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  \`;
  chatWindow.appendChild(header);

  // Messages Area
  const messagesArea = document.createElement('div');
  messagesArea.style.cssText = 'flex: 1; padding: 16px; overflow-y: auto; background-color: #f9fafb; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth;';
  chatWindow.appendChild(messagesArea);

  function addMessage(role, text) {
    const div = document.createElement('div');
    const isUser = role === 'user';
    div.style.cssText = \`
      max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-wrap: break-word;
      \${isUser 
        ? \`align-self: flex-end; background-color: \${config.style.backgroundColor}; color: white; border-bottom-right-radius: 2px;\`
        : 'align-self: flex-start; background-color: white; border: 1px solid #e5e7eb; color: #374151; border-bottom-left-radius: 2px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);'
      }
    \`;
    div.textContent = text;
    messagesArea.appendChild(div);
    messagesArea.scrollTo(0, messagesArea.scrollHeight);
  }

  addMessage('assistant', 'Hello! How can I help you today?');

  // Input Area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = 'padding: 16px; border-top: 1px solid #e5e7eb; background: white;';
  inputArea.innerHTML = \`
    <div style="position:relative; display:flex;">
      <input type="text" placeholder="Ask something..." style="width:100%; padding: 12px 42px 12px 16px; border-radius: 99px; border: 1px solid #e5e7eb; outline: none; font-size: 14px; background: #f3f4f6; transition: all 0.2s;">
      <button style="position:absolute; right: 8px; top: 50%; transform: translateY(-50%); background: \${config.style.backgroundColor}; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
    <div style="text-align:center; margin-top: 8px; font-size: 10px; color: #9ca3af;">Powered by \${config.model.provider}</div>
  \`;
  chatWindow.appendChild(inputArea);

  const input = inputArea.querySelector('input');
  const sendBtn = inputArea.querySelector('button');
  
  input.onfocus = () => input.style.background = 'white';
  input.onblur = () => input.style.background = '#f3f4f6';

  async function handleSend() {
    const text = input.value.trim();
    if(!text) return;
    
    addMessage('user', text);
    input.value = '';
    
    // Show typing
    const typingIndicator = document.createElement('div');
    typingIndicator.style.cssText = 'align-self: flex-start; padding: 10px; font-size: 12px; color: #6b7280; font-style: italic;';
    typingIndicator.textContent = 'Thinking...';
    messagesArea.appendChild(typingIndicator);
    messagesArea.scrollTo(0, messagesArea.scrollHeight);

    try {
      let reply = '';
      
      // --- SECURE PROXY MODE ---
      if (config.model.connectionMode === 'proxy') {
         // In proxy mode, we send a standardized JSON to the user's server.
         // The user's server is responsible for authentication and calling the AI.
         const response = await fetch(config.model.endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                 messages: [{ role: 'user', content: text }],
                 model: config.model.modelParam // Optional: Pass model intent to backend
             })
         });
         const data = await response.json();
         // Expecting standard { content: "..." } or OpenAI style response
         reply = data.content || data.choices?.[0]?.message?.content || data.output || "Error: Unknown response format";
      
      } else {
        // --- DIRECT MODE (Existing Logic) ---
        let fetchUrl = config.model.endpoint;
        let headers = { 'Content-Type': 'application/json' };
        let body = {};

        if (config.model.provider === 'openai') {
            headers['Authorization'] = 'Bearer ' + config.model.apiKey;
            body = {
                model: config.model.modelParam,
                messages: [{ role: 'user', content: text }]
            };
        } else if (config.model.provider === 'gemini') {
            fetchUrl = \`\${config.model.endpoint}/models/\${config.model.modelParam}:generateContent?key=\${config.model.apiKey}\`;
            body = { contents: [{ parts: [{ text: text }] }] };
        } else if (config.model.provider === 'anthropic') {
            headers['x-api-key'] = config.model.apiKey;
            headers['anthropic-version'] = '2023-06-01';
            headers['dangerously-allow-browser'] = 'true';
            body = {
                model: config.model.modelParam,
                max_tokens: 1024,
                messages: [{ role: 'user', content: text }]
            };
        }

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
            
        const data = await response.json();
        
        if (config.model.provider === 'openai') {
            reply = data.choices?.[0]?.message?.content || data.error?.message || 'Error: No response';
        } else if (config.model.provider === 'gemini') {
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error?.message || 'Error: No response';
        } else if (config.model.provider === 'anthropic') {
            reply = data.content?.[0]?.text || data.error?.message || 'Error: No response';
        }
      }
      
      messagesArea.removeChild(typingIndicator);
      addMessage('assistant', reply);
    } catch(e) {
      messagesArea.removeChild(typingIndicator);
      addMessage('assistant', 'Error: ' + e.message);
    }
  }

  sendBtn.onclick = handleSend;
  input.onkeydown = (e) => { if(e.key === 'Enter') handleSend(); };
  
  header.querySelector('#ai-close-btn').onclick = toggleChat;

  container.appendChild(chatWindow);

  // 3. Main Toggle Button
  const btn = document.createElement('button');
  btn.innerHTML = \`
    <div id="ai-icon-open" style="display:flex;align-items:center;justify-content:center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>
    <div id="ai-icon-close" style="display:none;align-items:center;justify-content:center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </div>
    \${config.style.label ? \`<span style="margin-left: 8px; font-weight: 600;">\${config.style.label}</span>\` : ''}
  \`;
  btn.style.cssText = \`
    display: flex; align-items: center; justify-content: center;
    background-color: \${config.style.backgroundColor};
    color: \${config.style.textColor};
    border-radius: \${config.style.borderRadius};
    padding: 14px 24px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  \`;
  
  btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';
  btn.onclick = toggleChat;

  function toggleChat() {
    const isHidden = chatWindow.style.display === 'none';
    const iconOpen = btn.querySelector('#ai-icon-open');
    const iconClose = btn.querySelector('#ai-icon-close');
    
    if (isHidden) {
        chatWindow.style.display = 'flex';
        // Small delay to allow display:flex to apply before opacity transition
        setTimeout(() => {
            chatWindow.style.opacity = '1';
            chatWindow.style.transform = 'translateY(0)';
        }, 10);
        iconOpen.style.display = 'none';
        iconClose.style.display = 'flex';
    } else {
        chatWindow.style.opacity = '0';
        chatWindow.style.transform = 'translateY(10px)';
        setTimeout(() => {
             chatWindow.style.display = 'none';
        }, 200);
        iconOpen.style.display = 'flex';
        iconClose.style.display = 'none';
    }
  }

  container.appendChild(btn);

})();
</script>`;
  };

  const code = generateSnippet();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Code size={20} className="text-indigo-600"/>
            Installation Code
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {model.connectionMode === 'direct' ? (
              <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                <div className="text-amber-600 mt-0.5"><AlertCircle size={18} /></div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Security Warning</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    You are in <strong>Direct API Mode</strong>. Your API Key is included in the code below. 
                    This is suitable for testing, internal tools, or if you use restricted keys (allowed domains only).
                    For public websites, switch to <strong>Proxy Mode</strong> in the Model Manager.
                  </p>
                </div>
              </div>
          ) : (
             <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded-lg flex gap-3">
                <div className="text-green-600 mt-0.5"><Lock size={18} /></div>
                <div>
                  <h4 className="text-sm font-semibold text-green-800">Secure Mode Active</h4>
                  <p className="text-xs text-green-700 mt-1 leading-relaxed">
                    Your API Key is NOT included. The widget will send requests to your proxy at <span className="font-mono bg-green-100 px-1 rounded">{model.endpoint}</span>.
                  </p>
                </div>
              </div>
          )}
          
          <div className="relative group">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-800 shadow-inner">
              {code}
            </pre>
            <button 
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-md backdrop-blur-md transition-colors border border-white/10"
            >
              {copied ? <Check size={16} className="text-green-400"/> : <Copy size={16} />}
            </button>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
             Paste this before the <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-600">&lt;/body&gt;</code> tag.
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);