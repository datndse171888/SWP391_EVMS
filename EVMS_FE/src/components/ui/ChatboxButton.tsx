import { MessageCircle, X, Send, Minimize2, Maximize2, Camera } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { conversationApi } from '../../api/ConversationApi';
import { messageApi, type Message as ApiMessage } from '../../api/MessageApi';

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
  imageUrl?: string;
  imageUrls?: string[];
}

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  newMessageCount: number;
}

const ChatboxButton: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    messages: [],
    newMessageCount: 0
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [conversationID, setConversationID] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation and messages
  const loadConversationAndMessages = useCallback(async () => {
    if (!user || user.role !== 'customer') return;

    try {
      setIsLoading(true);
      
      // Try to get existing conversation
      let conversation;
      try {
        const response = await conversationApi.getMyConversation();
        conversation = response.data.data;
        setConversationID(conversation._id);
      } catch (error: unknown) {
        // If no conversation found (404), create a new one
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          const createResponse = await conversationApi.createConversation(user.id);
          conversation = createResponse.data.data;
          setConversationID(conversation._id);
        } else {
          throw error;
        }
      }

      // Load messages
      if (conversation._id) {
        const messagesResponse = await messageApi.getMessagesByConversation(conversation._id, { limit: 50 });
        const apiMessages = messagesResponse.data.data;
        
        // Convert API messages to component messages
        const convertedMessages: Message[] = apiMessages.map((msg: ApiMessage) => {
          const senderID = typeof msg.senderID === 'string' ? msg.senderID : msg.senderID._id;
          const isFromUser = senderID === user.id;
          
          return {
            id: msg._id,
            text: msg.content,
            fromUser: isFromUser,
            timestamp: new Date(msg.timestamp),
            status: 'read' as const,
            imageUrl: msg.imageUrl,
            imageUrls: msg.imageUrls
          };
        });

        setChatState(prev => ({
          ...prev,
          messages: convertedMessages
        }));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Show error message to user
      setChatState(prev => ({
        ...prev,
        messages: [{
          id: 'error',
          text: 'Không thể tải cuộc trò chuyện. Vui lòng thử lại sau.',
          fromUser: false,
          timestamp: new Date(),
          status: 'read'
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load conversation and messages when chat opens
  useEffect(() => {
    if (chatState.isOpen && isAuthenticated && user && user.role === 'customer') {
      loadConversationAndMessages();
    }
  }, [chatState.isOpen, isAuthenticated, user, loadConversationAndMessages]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Vui lòng chọn file ảnh hợp lệ.');
      return;
    }

    // Validate file size (max 5MB per image)
    const validFiles = imageFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Ảnh ${file.name} vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Generate previews
    const previewPromises = validFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then(newPreviews => {
      setImagePreviews(prev => [...prev, ...newPreviews]);
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && selectedImages.length === 0) || !conversationID || !user || isSending || isUploadingImage) return;

    const messageText = inputMessage.trim() || (selectedImages.length > 0 ? '📷' : '');
    
    // Lưu lại giá trị để restore nếu lỗi
    const savedInputMessage = inputMessage;
    const savedSelectedImages = [...selectedImages];
    const savedImagePreviews = [...imagePreviews];
    
    // Upload tất cả ảnh nếu có
    const uploadedImageUrls: string[] = [];
    if (selectedImages.length > 0) {
      try {
        setIsUploadingImage(true);
        for (const image of selectedImages) {
          const uploadResponse = await messageApi.uploadImage(image);
          uploadedImageUrls.push(uploadResponse.data.imageUrl);
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('Không thể upload ảnh. Vui lòng thử lại.');
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // Clear input và previews sau khi upload thành công
    setInputMessage('');
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSending(true);

    // Optimistically add user message
    const tempMessageId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempMessageId,
      text: messageText,
      fromUser: true,
      timestamp: new Date(),
      status: 'sending',
      imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      imageUrl: uploadedImageUrls.length === 1 ? uploadedImageUrls[0] : undefined
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    try {
      // Send message via API
      const response = await messageApi.sendMessage(
        conversationID,
        messageText,
        uploadedImageUrls.length === 1 ? uploadedImageUrls[0] : undefined,
        uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined
      );
      const sentMessage = response.data.data;

      // Replace temp message with real message
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMessageId 
            ? {
                id: sentMessage._id,
                text: sentMessage.content,
                fromUser: true,
                timestamp: new Date(sentMessage.timestamp),
                status: 'sent',
                imageUrl: sentMessage.imageUrl,
                imageUrls: sentMessage.imageUrls
              }
            : msg
        )
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== tempMessageId)
      }));
      // Restore input và previews
      setInputMessage(savedInputMessage);
      setSelectedImages(savedSelectedImages);
      setImagePreviews(savedImagePreviews);
      // Show error
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
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
        className={`bg-white rounded-2xl shadow-2xl border transition-all duration-300 flex flex-col ${
          chatState.isMinimized ? 'h-14' : 'h-[500px] w-80'
        }`}
        style={{ borderColor: '#e5e7eb' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b rounded-t-2xl cursor-pointer flex-shrink-0"
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
                Trực tuyến
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
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
              {isLoading && chatState.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-500">Đang tải...</div>
                </div>
              ) : (
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
                      {/* Hiển thị ảnh */}
                      {(() => {
                        const images = message.imageUrls && message.imageUrls.length > 0 
                          ? message.imageUrls 
                          : message.imageUrl 
                            ? [message.imageUrl] 
                            : [];
                        return images.length > 0 ? (
                          <div className="mb-2 space-y-2">
                            {images.map((imgUrl, idx) => (
                              <img 
                                key={idx}
                                src={imgUrl} 
                                alt={`Message image ${idx + 1}`} 
                                className="max-w-full h-auto rounded-lg cursor-pointer"
                                onClick={() => window.open(imgUrl, '_blank')}
                                style={{ maxHeight: '200px' }}
                              />
                            ))}
                          </div>
                        ) : null;
                      })()}
                      {message.text && <p>{message.text}</p>}
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
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer - Input */}
            <div 
              className="border-t bg-white rounded-b-2xl flex-shrink-0"
              style={{ borderColor: '#e5e7eb' }}
            >
              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto" style={{ maxHeight: '80px' }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-14 h-14 object-cover rounded-lg border"
                        style={{ borderColor: '#e5e7eb' }}
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        aria-label="Xóa ảnh"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="p-4 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isSending || isUploadingImage || !conversationID}
                  className="p-2 rounded-full border transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  style={{ borderColor: '#e5e7eb' }}
                  aria-label="Chọn ảnh"
                >
                  <Camera className="w-4 h-4" style={{ color: '#014091' }} />
                </button>
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
                  disabled={isLoading || isSending || isUploadingImage || !conversationID}
                />
                <button
                  onClick={sendMessage}
                  disabled={(!inputMessage.trim() && selectedImages.length === 0) || isLoading || isSending || isUploadingImage || !conversationID}
                  className="p-2 rounded-full text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  style={{ backgroundColor: '#014091' }}
                  aria-label="Gửi tin nhắn"
                >
                  {isUploadingImage ? (
                    <span className="text-xs">...</span>
                  ) : isSending ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
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