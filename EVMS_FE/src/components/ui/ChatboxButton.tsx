import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
}

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  newMessageCount: number;
}

const ChatboxButton: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    messages: [],
    newMessageCount: 0
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data - initial messages
  const mockInitialMessages: Message[] = [
    {
      id: '1',
      text: 'Xin chào! Chào mừng bạn đến với EVMS. Tôi có thể hỗ trợ gì cho bạn?',
      fromUser: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: 'read'
    },
    {
      id: '2',
      text: 'Chúng tôi cung cấp dịch vụ bảo dưỡng và sửa chữa xe điện chuyên nghiệp. Bạn có muốn đặt lịch không?',
      fromUser: false,
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      status: 'read'
    }
  ];

  // Mock auto responses
  const mockAutoResponses = [
    'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.',
    'Bạn có thể đặt lịch qua trang web hoặc gọi hotline 1900-xxxx.',
    'Dịch vụ của chúng tôi bao gồm: bảo dưỡng định kỳ, sửa chữa và thay thế phụ tùng.',
    'Thời gian làm việc: 8:00 - 18:00 từ thứ 2 đến thứ 7.',
    'Chúng tôi hỗ trợ tất cả các loại xe điện: ô tô, xe máy, xe đạp điện.'
  ];

  // Auto scroll to bottom when new messages
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Initialize mock messages on first open
  useEffect(() => {
    if (chatState.isOpen && chatState.messages.length === 0) {
      setChatState(prev => ({
        ...prev,
        messages: mockInitialMessages
      }));
    }
  }, [chatState.isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setChatState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      newMessageCount: prev.isOpen ? prev.newMessageCount : 0
    }));
  };

  const minimizeChat = () => {
    setChatState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }));
  };

  const closeChat = () => {
    setChatState(prev => ({
      ...prev,
      isOpen: false,
      isMinimized: false
    }));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      fromUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    // Add user message
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setInputMessage('');
    setIsTyping(true);

    // Simulate sending and auto response
    setTimeout(() => {
      // Update message status to sent
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      }));

      // Auto response after delay
      setTimeout(() => {
        const randomResponse = mockAutoResponses[Math.floor(Math.random() * mockAutoResponses.length)];
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          fromUser: false,
          timestamp: new Date(),
          status: 'read'
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, autoReply],
          newMessageCount: prev.isOpen && !prev.isMinimized ? prev.newMessageCount : prev.newMessageCount + 1
        }));
        setIsTyping(false);
      }, 1500);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Render chat button (dạng 1)
  if (!chatState.isOpen) {
    return (
      <div className="fixed bottom-25 right-6 z-50">
        <button
          onClick={toggleChat}
          className="relative bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          style={{ fontFamily: 'Inter, sans-serif' }}
          aria-label="Mở chat hỗ trợ"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Notification badge */}
          {chatState.newMessageCount > 0 && (
            <span 
              className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse"
              style={{ backgroundColor: '#f6ae2d' }}
            >
              {chatState.newMessageCount > 9 ? '9+' : chatState.newMessageCount}
            </span>
          )}

          {/* Decorative pings */}
          <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-pink-400/90 animate-ping opacity-70" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-emerald-400/90 animate-ping delay-150" />
        </button>
      </div>
    );
  }

  // Render chat window (dạng 2)
  return (
    <div className="fixed bottom-35 right-6 z-50">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border transition-all duration-300 ${
          chatState.isMinimized ? 'h-14' : 'h-96 w-80'
        }`}
        style={{ borderColor: '#e5e7eb' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b rounded-t-2xl cursor-pointer"
          style={{ 
            backgroundColor: '#014091',
            borderColor: '#e5e7eb'
          }}
          onClick={minimizeChat}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-white/20">
              E
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">EVMS Support</h3>
              <p className="text-white/80 text-xs">
                {isTyping ? 'Đang trả lời...' : 'Trực tuyến'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeChat();
              }}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label={chatState.isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
            >
              {chatState.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeChat();
              }}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Messages */}
        {!chatState.isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto max-h-64 bg-gray-50">
              <div className="space-y-3">
                {chatState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.fromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        message.fromUser
                          ? 'text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm border'
                      }`}
                      style={{
                        backgroundColor: message.fromUser ? '#014091' : 'white',
                        borderColor: message.fromUser ? 'transparent' : '#e5e7eb'
                      }}
                    >
                      <p>{message.text}</p>
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        message.fromUser ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.fromUser && (
                          <span className="ml-2">
                            {message.status === 'sending' && '⏳'}
                            {message.status === 'sent' && '✓'}
                            {message.status === 'read' && '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border px-3 py-2 rounded-2xl rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Footer - Input */}
            <div 
              className="p-4 border-t bg-white rounded-b-2xl"
              style={{ borderColor: '#e5e7eb' }}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    borderColor: '#e5e7eb',
                  }}
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2 rounded-full text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#014091' }}
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatboxButton;