import React, { useState, useEffect, useRef } from 'react';
import { EntranceScreen } from './components/EntranceScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { VoiceModal } from './components/VoiceModal';
import { ThinkExperience } from './components/ThinkExperience';
import { CodeExperience } from './components/CodeExperience';
import { VisionExperience } from './components/VisionExperience';
import { StudyExperience } from './components/StudyExperience';
import { DocumentExperience } from './components/DocumentExperience';
import { CreateExperience } from './components/CreateExperience';
import { ExploreHub } from './components/ExploreHub';
import { ToolsHub } from './components/ToolsHub';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AboutModal } from './components/AboutModal';
import {
  ActiveView,
  Conversation,
  Message,
  MemoryItem,
  UserSettings,
  UserProfile,
  ImageAttachment,
  DocumentAttachment,
  WebSource,
  AppTheme,
} from './types';
import { buildSystemPrompt } from './utils/logic';
import { VoiceCommandResult } from './utils/voiceCommands';
import { playSendSound, playReceiveSound } from './utils/audioSystem';
import { speakText, stopSpeaking } from './utils/speechSystem';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'obsidian',
  accentColor: 'purple',
  fontSize: 'md',
  language: 'English',
  responseStyle: 'balanced',
  voiceVoice: 'Orvexis Nova',
  voiceGender: 'female',
  voicePitch: 1.0,
  voiceRate: 1.0,
  autoReadResponses: true,
  handsFreeMode: false,
  memoryEnabled: true,
  webSearchEnabled: false,
  soundEffects: true,
  userName: '',
  thinkingLevel: 'extraordinary',
  speedEngine: 'hyper-fast',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Architect',
  callSign: 'Nexus Architect',
  title: 'Lead Systems Engineer',
  bio: 'Exploring frontier digital intelligence, distributed architecture, and quantum neural models.',
  avatarIcon: 'default',
  nativeLanguage: 'English',
  interests: ['Quantum Computing', 'Distributed Consensus', 'Machine Learning', 'Bangla Linguistics'],
  stats: {
    queriesCount: 14,
    voiceSessions: 3,
    codeModulesBuilt: 6,
    memoriesStored: 2,
  },
};

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'm-1',
    key: 'Core Philosophy',
    value: 'Beyond the Mind. Beyond Limits. Prioritizing structured rigor and truth over assumptions.',
    category: 'identity',
    createdAt: Date.now(),
    enabled: true,
  },
];

export default function App() {
  // Check for ?autostart=1 to bypass intro screen automatically
  const [showEntrance, setShowEntrance] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return false;
      }
    }
    return true;
  });

  // Active View & Navigation
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('orvexis_settings_v2');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('orvexis_profile_v2');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // User Memories
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('orvexis_memories_v2');
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('orvexis_conversations_v2');
      if (saved) return JSON.parse(saved);
    } catch {}

    const initialId = 'conv-init-1';
    return [
      {
        id: initialId,
        title: 'Initialization Session',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: 'init-msg-1',
            role: 'assistant',
            content: `### Welcome to ORVEXIS AI (Version 2.0 — Next Generation)
*Beyond the Mind. Beyond Limits.*

I am your autonomous personal intelligence. My neural framework is upgraded with continuous voice dialogue, structured cognitive reasoning, multimodal image inspection, verified web grounding, and specialized coding and study environments.

How can I assist your explorations today?`,
            timestamp: Date.now(),
          },
        ],
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || 'conv-init-1';
  });

  // Chat Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('orvexis_settings_v2', JSON.stringify(settings));
  }, [settings]);

  // Persist Profile
  useEffect(() => {
    localStorage.setItem('orvexis_profile_v2', JSON.stringify(profile));
  }, [profile]);

  // Persist Memories
  useEffect(() => {
    localStorage.setItem('orvexis_memories_v2', JSON.stringify(memories));
  }, [memories]);

  // Persist Conversations
  useEffect(() => {
    localStorage.setItem('orvexis_conversations_v2', JSON.stringify(conversations));
  }, [conversations]);

  // Current active conversation
  const currentConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Helper to create a new chat session
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveView('chat');
  };

  // Helper to delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const freshId = `conv-${Date.now()}`;
        return [
          {
            id: freshId,
            title: 'New Session',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          },
        ];
      }
      return filtered;
    });

    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      }
    }
  };

  // Voice Command Dispatcher
  const handleExecuteVoiceAction = (actionResult: VoiceCommandResult) => {
    setProfile((prev) => ({
      ...prev,
      stats: { ...prev.stats, voiceSessions: prev.stats.voiceSessions + 1 },
    }));

    if (actionResult.action === 'navigate' && actionResult.targetView) {
      setActiveView(actionResult.targetView);
    } else if (actionResult.action === 'new-chat') {
      handleNewChat();
    } else if (actionResult.action === 'toggle-search') {
      setSettings((prev) => ({
        ...prev,
        webSearchEnabled: !prev.webSearchEnabled,
      }));
    } else if (actionResult.action === 'change-theme') {
      const themes: AppTheme[] = ['obsidian', 'cyber-indigo', 'electric-cyan', 'neon-amethyst'];
      const currentIdx = themes.indexOf(settings.theme);
      const nextTheme = themes[(currentIdx + 1) % themes.length];
      setSettings((prev) => ({ ...prev, theme: nextTheme }));
    } else if (actionResult.action === 'open-settings') {
      setIsSettingsOpen(true);
    } else if (actionResult.action === 'open-profile') {
      setIsProfileOpen(true);
    }
  };

  // Handle Send Message via streaming SSE with Web Grounding Support
  const handleSendMessage = async (
    content: string,
    imageAttachment?: ImageAttachment,
    documentAttachment?: DocumentAttachment
  ) => {
    if (isStreaming) return;

    // Play message send sound effect
    playSendSound(settings.soundEffects);

    // Increment queries count
    setProfile((prev) => ({
      ...prev,
      stats: { ...prev.stats, queriesCount: prev.stats.queriesCount + 1 },
    }));

    const userMsgId = `usr-${Date.now()}`;
    const assistantMsgId = `ast-${Date.now() + 1}`;

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: Date.now(),
      imageAttachment,
      documentAttachment,
    };

    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          const isFirstMessage = conv.messages.length === 0;
          let newTitle = conv.title;
          if (isFirstMessage && content) {
            newTitle = content.slice(0, 36) + (content.length > 36 ? '...' : '');
          }
          return {
            ...conv,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...conv.messages, userMessage, initialAssistantMessage],
          };
        }
        return conv;
      })
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      // Prune history to exclude errors and keep last 8 turns for high throughput and reduced token latency
      const historyToSend = (currentConversation?.messages || [])
        .filter((m) => !m.error && m.content && m.content.trim().length > 0)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }))
        .concat([{ role: 'user', content }]);

      const dynamicSystemPrompt = buildSystemPrompt(settings, memories, activeView);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: historyToSend,
          systemInstruction: dynamicSystemPrompt,
          imageAttachment,
          webSearchEnabled: settings.webSearchEnabled,
          thinkingLevel: settings.thinkingLevel || 'extraordinary',
          speedEngine: settings.speedEngine || 'hyper-fast',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to reach ORVEXIS engine.`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let accumulatedSources: WebSource[] = [];
      let accumulatedSearchQueries: string[] = [];
      let latestSpeedMetrics: { tokensPerSec?: number; elapsedMs?: number } | undefined;
      let hasReceivedError = false;
      let isQuotaError = false;

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { value, done } = await reader.read();
          isDone = done;
          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataString = line.replace('data: ', '').trim();
                if (dataString === '[DONE]') {
                  isDone = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(dataString);
                  if (parsed.text) {
                    accumulatedText += parsed.text;
                  }
                  if (parsed.sources && Array.isArray(parsed.sources)) {
                    accumulatedSources = parsed.sources;
                  }
                  if (parsed.searchQueries && Array.isArray(parsed.searchQueries)) {
                    accumulatedSearchQueries = parsed.searchQueries;
                  }
                  if (parsed.speedMetrics) {
                    latestSpeedMetrics = parsed.speedMetrics;
                  }
                  if (parsed.error) {
                    hasReceivedError = true;
                    isQuotaError = Boolean(parsed.isQuota);
                    accumulatedText = parsed.error;
                  }

                  // Update assistant bubble in state with speed metrics and sources
                  setConversations((prev) =>
                    prev.map((conv) => {
                      if (conv.id === activeConversationId) {
                        return {
                          ...conv,
                          messages: conv.messages.map((m) =>
                            m.id === assistantMsgId
                              ? {
                                  ...m,
                                  content: accumulatedText,
                                  sources: accumulatedSources.length > 0 ? accumulatedSources : undefined,
                                  searchQueries: accumulatedSearchQueries.length > 0 ? accumulatedSearchQueries : undefined,
                                  speedMetrics: latestSpeedMetrics,
                                  error: hasReceivedError,
                                  isQuota: isQuotaError,
                                  isStreaming: true,
                                }
                              : m
                          ),
                        };
                      }
                      return conv;
                    })
                  );
                } catch {
                  // Ignore keep-alive
                }
              }
            }
          }
        }
      }

      // Mark streaming done
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: accumulatedText,
                      sources: accumulatedSources.length > 0 ? accumulatedSources : undefined,
                      searchQueries: accumulatedSearchQueries.length > 0 ? accumulatedSearchQueries : undefined,
                      speedMetrics: latestSpeedMetrics,
                      error: hasReceivedError,
                      isQuota: isQuotaError,
                      isStreaming: false,
                    }
                  : m
              ),
            };
          }
          return conv;
        })
      );

      // Play message received chime
      playReceiveSound(settings.soundEffects);

      // Auto read response aloud like ChatGPT Voice Mode
      if (settings.autoReadResponses && accumulatedText && !hasReceivedError) {
        speakText(accumulatedText, {
          voiceGender: settings.voiceGender,
          voiceRate: settings.voiceRate,
          voicePitch: settings.voicePitch,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted intentionally
      } else {
        console.error('Chat error:', err);
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `**ORVEXIS Link Interrupted:** ${
                          err.message || 'Unable to establish streaming neural channel.'
                        }\n\n*Check that GEMINI_API_KEY is available in your AI Studio Secrets panel.*`,
                        error: true,
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return conv;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopSpeaking();
    setIsStreaming(false);
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (!currentConversation || currentConversation.messages.length < 2) return;
    const msgs = currentConversation.messages;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          const filtered = conv.messages.filter((m, idx) => idx !== conv.messages.length - 1);
          return { ...conv, messages: filtered };
        }
        return conv;
      })
    );

    handleSendMessage(
      lastUserMsg.content,
      lastUserMsg.imageAttachment,
      lastUserMsg.documentAttachment
    );
  };

  // Memory Handlers
  const handleAddMemory = (
    key: string,
    value: string,
    category: 'preference' | 'fact' | 'work' | 'identity'
  ) => {
    const item: MemoryItem = {
      id: `mem-${Date.now()}`,
      key,
      value,
      category,
      createdAt: Date.now(),
      enabled: true,
    };
    setMemories((prev) => [item, ...prev]);
    setProfile((prev) => ({
      ...prev,
      stats: { ...prev.stats, memoriesStored: prev.stats.memoriesStored + 1 },
    }));
  };

  const handleToggleMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = () => {
    setMemories([]);
  };

  const handleClearAllConversations = () => {
    const newId = `conv-${Date.now()}`;
    const fresh = [
      {
        id: newId,
        title: 'New Session',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      },
    ];
    setConversations(fresh);
    setActiveConversationId(newId);
  };

  const handleExportHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            conversations,
            memories,
            profile,
            settings,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `orvexis_ai_archive_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Send a synthesized prompt from another view to Chat
  const handleSendToChat = (content: string, imageAttachment?: any) => {
    setActiveView('chat');
    handleSendMessage(content, imageAttachment);
  };

  // Send query via Voice Modal
  const handleSendVoiceQuery = async (query: string): Promise<string> => {
    try {
      const dynamicPrompt = buildSystemPrompt(settings, memories, 'voice');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          systemInstruction: `${dynamicPrompt}\nKeep your answer short, natural, and conversational suitable for spoken voice response.`,
        }),
      });

      if (!res.ok) throw new Error('Voice query failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { value, done } = await reader.read();
          isDone = done;
          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataString = line.replace('data: ', '').trim();
                if (dataString === '[DONE]') break;
                try {
                  const parsed = JSON.parse(dataString);
                  if (parsed.text) fullText += parsed.text;
                } catch {}
              }
            }
          }
        }
      }
      return fullText || 'ORVEXIS acknowledges your transmission.';
    } catch (err: any) {
      return 'Voice processing encountered a temporary interruption.';
    }
  };

  // Render Entrance Screen if active
  if (showEntrance) {
    return (
      <EntranceScreen
        onEnter={() => {
          setShowEntrance(false);
        }}
      />
    );
  }

  // Get last assistant message for repeat
  const lastAssistantMsg = [...(currentConversation?.messages || [])]
    .reverse()
    .find((m) => m.role === 'assistant')?.content || '';

  // Render Interior Application
  return (
    <div
      className={`min-h-screen w-full flex bg-[#06070c] text-slate-100 font-sans selection:bg-purple-600/30 selection:text-purple-200 overflow-hidden ${
        settings.fontSize === 'sm'
          ? 'text-xs'
          : settings.fontSize === 'lg'
          ? 'text-base'
          : 'text-sm'
      }`}
    >
      {/* Collapsible Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={(v) => {
          if (v === 'settings') {
            setIsSettingsOpen(true);
          } else if (v === 'profile') {
            setIsProfileOpen(true);
          } else if (v === 'about') {
            setIsAboutOpen(true);
          } else {
            setActiveView(v);
          }
        }}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        memoryCount={memories.filter((m) => m.enabled).length}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header Bar */}
        <Header
          activeView={activeView}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onReplayIntro={() => setShowEntrance(true)}
          settings={settings}
          onToggleWebSearch={() =>
            setSettings((prev) => ({
              ...prev,
              webSearchEnabled: !prev.webSearchEnabled,
            }))
          }
          memoryCount={memories.filter((m) => m.enabled).length}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeView === 'chat' && (
            <ChatInterface
              messages={currentConversation?.messages || []}
              isStreaming={isStreaming}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              onStopGeneration={handleStopGeneration}
              onNewChat={handleNewChat}
              settings={settings}
              onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
            />
          )}

          {activeView === 'explore' && (
            <ExploreHub
              onSelectPrompt={(prompt, targetView) => {
                if (targetView && targetView !== 'explore') {
                  setActiveView(targetView);
                } else {
                  setActiveView('chat');
                }
                handleSendMessage(prompt);
              }}
              onNavigateView={(v) => setActiveView(v)}
            />
          )}

          {activeView === 'think' && (
            <ThinkExperience onSendToChat={handleSendToChat} />
          )}

          {activeView === 'code' && (
            <CodeExperience onSendToChat={handleSendToChat} />
          )}

          {activeView === 'vision' && (
            <VisionExperience onSendToChat={handleSendToChat} />
          )}

          {activeView === 'study' && (
            <StudyExperience onSendToChat={handleSendToChat} />
          )}

          {activeView === 'document' && (
            <DocumentExperience onSendToChat={handleSendToChat} />
          )}

          {activeView === 'create' && (
            <CreateExperience onSendToChat={handleSendToChat} />
          )}

          {activeView === 'tools' && (
            <ToolsHub onSendToChat={handleSendToChat} />
          )}
        </main>
      </div>

      {/* Voice Matrix Fullscreen Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        onSendVoiceQuery={handleSendVoiceQuery}
        onExecuteVoiceAction={handleExecuteVoiceAction}
        lastResponse={lastAssistantMsg}
      />

      {/* Personalization & Memory Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) =>
          setSettings((prev) => ({ ...prev, ...updated }))
        }
        memories={memories}
        onAddMemory={handleAddMemory}
        onToggleMemory={handleToggleMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
        onClearAllConversations={handleClearAllConversations}
        onExportHistory={handleExportHistory}
      />

      {/* Personal Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        totalConversations={conversations.length}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
