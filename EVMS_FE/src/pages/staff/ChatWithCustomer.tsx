import React, { useState, useEffect, useCallback } from 'react';
import { conversationApi, type Conversation as ApiConversation } from '../../api/ConversationApi';
import { messageApi, type Message as ApiMessage } from '../../api/MessageApi';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import type { VehicleResponse } from '../../types/Vehicle';
import { api } from '../../utils/Axios';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
}

interface MessageItem {
  id: string;
  fromMe: boolean;
  text?: string;
  time: string;
  senderName?: string;
  senderAvatar?: string;
  attachmentUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

const Bubble: React.FC<{ item: MessageItem }> = ({ item }) => {
  const base = 'max-w-[75%] px-3 py-2 rounded-2xl text-sm';
  // Ưu tiên imageUrls (array), nếu không có thì dùng imageUrl (single)
  const images = item.imageUrls && item.imageUrls.length > 0 
    ? item.imageUrls 
    : item.imageUrl 
      ? [item.imageUrl] 
      : [];
  
  if (item.fromMe) {
    return (
      <div className="flex justify-end mb-2">
        <div className={`${base}`} style={{ backgroundColor: '#f6ae2d' }}>
          {images.length > 0 && (
            <div className="mb-2 space-y-2">
              {images.map((imgUrl, idx) => (
                <img 
                  key={idx}
                  src={imgUrl} 
                  alt={`Message image ${idx + 1}`} 
                  className="max-w-full h-auto rounded-lg cursor-pointer"
                  onClick={() => window.open(imgUrl, '_blank')}
                  style={{ maxHeight: '300px' }}
                />
              ))}
            </div>
          )}
          {item.text && <p style={{ color: '#014091' }}>{item.text}</p>}
          {item.attachmentUrl && (
            <a className="underline" href={item.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: '#0991f3' }}>Attachment</a>
          )}
          <div className="text-[10px] mt-1 text-right" style={{ color: '#5f6777' }}>{item.time}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start mb-2 items-end gap-2">
      {item.senderAvatar ? (
        <img src={item.senderAvatar} alt={item.senderName || 'User'} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>
          {(item.senderName || 'U').charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`${base} bg-white shadow-sm border border-gray-100`}>
        {item.senderName && !item.fromMe && (
          <p className="text-[10px] font-semibold mb-1" style={{ color: '#014091' }}>{item.senderName}</p>
        )}
        {images.length > 0 && (
          <div className="mb-2 space-y-2">
            {images.map((imgUrl, idx) => (
              <img 
                key={idx}
                src={imgUrl} 
                alt={`Message image ${idx + 1}`} 
                className="max-w-full h-auto rounded-lg cursor-pointer"
                onClick={() => window.open(imgUrl, '_blank')}
                style={{ maxHeight: '300px' }}
              />
            ))}
          </div>
        )}
        {item.text && <p style={{ color: '#014091' }}>{item.text}</p>}
        {item.attachmentUrl && (
          <a className="underline" href={item.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: '#0991f3' }}>Attachment</a>
        )}
        <div className="text-[10px] mt-1" style={{ color: '#5f6777' }}>{item.time}</div>
      </div>
    </div>
  );
};

const ChatWithCustomer: React.FC = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [activeId, setActiveId] = useState<string>('');
  const [assigned, setAssigned] = useState<Conversation[]>([]);
  const [newCustomers, setNewCustomers] = useState<Conversation[]>([]);
  const [allAssigned, setAllAssigned] = useState<Conversation[]>([]); // Store all assigned for filtering
  const [allNewCustomers, setAllNewCustomers] = useState<Conversation[]>([]); // Store all new customers for filtering
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false); // default hidden
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ApiConversation | null>(null);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerVehicles, setCustomerVehicles] = useState<VehicleResponse[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Format time từ createdAt
  const formatTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Format time cho message (HH:mm)
  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Load conversations open
  const loadOpenConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await conversationApi.getAllConversationOpen({ limit: 50 });
      const conversations = response.data.data;
      
      // Map API data về format hiển thị
      const mappedConversations: Conversation[] = conversations.map((conv: ApiConversation) => {
        const userID = typeof conv.userID === 'string' ? null : conv.userID;
        const userName = userID?.fullName || userID?.userName || 'Unknown';
        
        // Lấy nội dung tin nhắn mới nhất hoặc fallback
        const lastMessageText = conv.lastMessage?.content 
          ? (conv.lastMessage.content.length > 50 
              ? conv.lastMessage.content.substring(0, 50) + '...' 
              : conv.lastMessage.content)
          : 'Tin nhắn mới...';
        
        return {
          id: conv._id,
          name: userName,
          lastMessage: lastMessageText,
          time: formatTimeAgo(conv.createdAt),
          avatar: userID?.photoURL,
        };
      });
      
      setNewCustomers(mappedConversations);
      setAllNewCustomers(mappedConversations); // Store for filtering
    } catch (error) {
      console.error('Error loading open conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load assigned conversations
  const loadAssignedConversations = useCallback(async () => {
    try {
      setIsLoadingAssigned(true);
      const response = await conversationApi.getAllConversationAssigned({ limit: 50 });
      const conversations = response.data.data;
      
      // Map API data về format hiển thị
      const mappedConversations: Conversation[] = conversations.map((conv: ApiConversation) => {
        const userID = typeof conv.userID === 'string' ? null : conv.userID;
        const userName = userID?.fullName || userID?.userName || 'Unknown';
        
        // Lấy nội dung tin nhắn mới nhất hoặc fallback
        const lastMessageText = conv.lastMessage?.content 
          ? (conv.lastMessage.content.length > 50 
              ? conv.lastMessage.content.substring(0, 50) + '...' 
              : conv.lastMessage.content)
          : 'Tin nhắn mới...';
        
        return {
          id: conv._id,
          name: userName,
          lastMessage: lastMessageText,
          time: formatTimeAgo(conv.createdAt),
          avatar: userID?.photoURL,
        };
      });
      
      setAssigned(mappedConversations);
      setAllAssigned(mappedConversations); // Store for filtering
      
      // Set activeId là conversation đầu tiên nếu có
      setActiveId((prev) => {
        if (!prev && mappedConversations.length > 0) {
          return mappedConversations[0].id;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error loading assigned conversations:', error);
    } finally {
      setIsLoadingAssigned(false);
    }
  }, []);

  // Load conversations khi component mount
  useEffect(() => {
    loadOpenConversations();
    loadAssignedConversations();
  }, [loadOpenConversations, loadAssignedConversations]);

  const acceptNew = async (id: string) => {
    try {
      // Gọi API assign conversation
      const response = await conversationApi.assignConversation(id);
      const assignedConv = response.data.data;
      
      // Map conversation đã assign
      const userID = typeof assignedConv.userID === 'string' ? null : assignedConv.userID;
      const userName = userID?.fullName || userID?.userName || 'Unknown';
      
      // Lấy nội dung tin nhắn mới nhất hoặc fallback
      const lastMessageText = assignedConv.lastMessage?.content 
        ? (assignedConv.lastMessage.content.length > 50 
            ? assignedConv.lastMessage.content.substring(0, 50) + '...' 
            : assignedConv.lastMessage.content)
        : 'Tin nhắn mới...';
      
      const mappedConv: Conversation = {
        id: assignedConv._id,
        name: userName,
        lastMessage: lastMessageText,
        time: 'now',
        avatar: userID?.photoURL,
      };
      
      // Thêm vào assigned và xóa khỏi newCustomers
      setAssigned((prev) => [mappedConv, ...prev]);
      setNewCustomers((prev) => prev.filter((c) => c.id !== id));
      setActiveId(id);
      
      // Refresh danh sách
      loadOpenConversations();
      loadAssignedConversations();
      
      // Load messages cho conversation vừa accept
      loadConversationAndMessages(id);
    } catch (error) {
      console.error('Error accepting conversation:', error);
      alert('Không thể nhận conversation. Vui lòng thử lại.');
    }
  };

  // Load conversation và messages khi click vào conversation
  const loadConversationAndMessages = useCallback(async (conversationID: string) => {
    if (!conversationID) return;

    try {
      setIsLoadingMessages(true);
      
      // Gọi API getConversationByID và getMessagesByConversation song song
      const [conversationResponse, messagesResponse] = await Promise.all([
        conversationApi.getConversationByID(conversationID),
        messageApi.getMessagesByConversation(conversationID, { limit: 100, excludeBot: true })
      ]);

      const conversation = conversationResponse.data.data;
      const apiMessages = messagesResponse.data.data;

      // Set active conversation
      setActiveConversation(conversation);

      // Map messages từ API về format hiển thị
      const mappedMessages: MessageItem[] = apiMessages.map((msg: ApiMessage) => {
        const senderID = typeof msg.senderID === 'string' ? null : msg.senderID;
        const currentUserID = user?.id;
        const senderIDValue = typeof msg.senderID === 'string' ? msg.senderID : msg.senderID._id;
        const isFromMe = currentUserID && senderIDValue === currentUserID;

        return {
          id: msg._id,
          fromMe: isFromMe || false,
          text: msg.content,
          time: formatMessageTime(msg.timestamp),
          senderName: senderID ? (senderID.fullName || senderID.userName || 'User') : undefined,
          senderAvatar: senderID?.photoURL,
          imageUrl: msg.imageUrl,
          imageUrls: msg.imageUrls,
        };
      });

      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error loading conversation and messages:', error);
      setMessages([]);
      setActiveConversation(null);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join conversation room via Socket.io
  useEffect(() => {
    if (socket && activeConversation?._id) {
      socket.emit('joinConversation', activeConversation._id);
      
      return () => {
        socket.emit('leaveConversation', activeConversation._id);
      };
    }
  }, [socket, activeConversation?._id]);

  // Listen for new messages via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      const senderID = message.senderID;
      const isFromMe = senderID._id === user?.id;
      
      // Nếu là message của mình, tìm và replace optimistic message
      if (isFromMe) {
        setMessages((prev) => {
          // Tìm optimistic message (id bắt đầu bằng "temp-")
          const tempIndex = prev.findIndex((msg) => msg.id.startsWith('temp-'));
          if (tempIndex !== -1) {
            // Replace optimistic message
            const updated = [...prev];
            updated[tempIndex] = {
              id: message._id,
              fromMe: true,
              text: message.content,
              time: formatMessageTime(message.timestamp),
              imageUrl: message.imageUrl,
              imageUrls: message.imageUrls,
            };
            return updated;
          }
          // Nếu không tìm thấy optimistic message, add như message mới
          return [...prev, {
            id: message._id,
            fromMe: true,
            text: message.content,
            time: formatMessageTime(message.timestamp),
            imageUrl: message.imageUrl,
            imageUrls: message.imageUrls,
          }];
        });
      } else {
        // Message từ người khác, add vào
        const mappedMessage: MessageItem = {
          id: message._id,
          fromMe: false,
          text: message.content,
          time: formatMessageTime(message.timestamp),
          senderName: senderID ? (senderID.fullName || senderID.userName || 'User') : undefined,
          senderAvatar: senderID?.photoURL,
          imageUrl: message.imageUrl,
          imageUrls: message.imageUrls,
        };
        setMessages((prev) => [...prev, mappedMessage]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('error');
    };
  }, [socket, user]);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAssigned(allAssigned);
      setNewCustomers(allNewCustomers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filteredAssigned = allAssigned.filter((conv) =>
      conv.name.toLowerCase().includes(query)
    );
    const filteredNew = allNewCustomers.filter((conv) =>
      conv.name.toLowerCase().includes(query)
    );

    setAssigned(filteredAssigned);
    setNewCustomers(filteredNew);
  }, [searchQuery, allAssigned, allNewCustomers]);

  // Load customer vehicles
  const loadCustomerVehicles = useCallback(async (userID: string) => {
    try {
      setIsLoadingVehicles(true);
      // Sử dụng api utility để gọi getAllVehicles với filter userID
      const response = await api.get(`/vehicles?userID=${userID}`);
      if (response.data.success && response.data.data?.items) {
        setCustomerVehicles(response.data.data.items);
      } else {
        setCustomerVehicles([]);
      }
    } catch (error) {
      console.error('Error loading customer vehicles:', error);
      setCustomerVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  // Load customer vehicles when activeConversation changes
  useEffect(() => {
    if (activeConversation && showDetails) {
      const userID = typeof activeConversation.userID === 'string' 
        ? activeConversation.userID 
        : activeConversation.userID?._id;
      
      if (userID) {
        loadCustomerVehicles(userID);
      } else {
        setCustomerVehicles([]);
      }
    } else {
      setCustomerVehicles([]);
    }
  }, [activeConversation, showDetails, loadCustomerVehicles]);

  // Load messages khi activeId thay đổi
  useEffect(() => {
    if (activeId) {
      loadConversationAndMessages(activeId);
      setInputMessage(''); // Clear input when switching conversation
    } else {
      setMessages([]);
      setActiveConversation(null);
      setInputMessage('');
    }
  }, [activeId, loadConversationAndMessages]);

  // Handle file selection (multiple images)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    
    // Validate files first
    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} không phải là ảnh!`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Ảnh ${file.name} vượt quá 5MB!`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Read all files and create previews
    const previewPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((previews) => {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...previews]);
    });
  };

  // Remove selected image
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && selectedImages.length === 0) || !activeConversation || isSending || isUploadingImage) return;

    const messageText = inputMessage.trim() || (selectedImages.length > 0 ? '📷' : '');
    
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

    setInputMessage('');
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSending(true);

    // Optimistically add message
    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempMessageId,
      fromMe: true,
      text: messageText,
      time: formatMessageTime(new Date().toISOString()),
      imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      imageUrl: uploadedImageUrls.length === 1 ? uploadedImageUrls[0] : undefined,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Gửi message via Socket.io
      if (socket && socket.connected) {
        socket.emit('sendMessage', {
          conversationID: activeConversation._id,
          content: messageText,
          imageUrl: uploadedImageUrls.length === 1 ? uploadedImageUrls[0] : undefined,
          imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        });
        // Message will be confirmed via newMessage event in the main listener
        setIsSending(false);
      } else {
        // Fallback to API if socket not connected
        const response = await messageApi.sendMessage(
          activeConversation._id,
          messageText,
          uploadedImageUrls.length === 1 ? uploadedImageUrls[0] : undefined,
          uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined
        );
        const sentMessage = response.data.data;

        // Replace temp message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  id: sentMessage._id,
                  fromMe: true,
                  text: sentMessage.content,
                  time: formatMessageTime(sentMessage.timestamp),
                  imageUrl: sentMessage.imageUrl,
                  imageUrls: sentMessage.imageUrls,
                }
              : msg
          )
        );
        setIsSending(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      // Restore input
      setInputMessage(messageText);
      setSelectedImages(selectedImages);
      setImagePreviews(imagePreviews);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex h-screen">
        {/* Far Left: New Customers (toggleable) */}
        {showNew && (
          <aside className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0 h-screen" style={{ backgroundColor: '#f8fafc' }}>
            {/* Header - Fixed */}
            <div className="px-3 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
              <p className="text-xs font-semibold" style={{ color: '#014091' }}>🆕 Khách cần hỗ trợ ({newCustomers.length})</p>
              <button onClick={() => setShowNew(false)} className="text-[10px] px-2 py-1 rounded-md border hover:bg-gray-50" style={{ borderColor: '#8abdfe', color: '#014091' }}>Ẩn</button>
            </div>
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {isLoading ? (
                <div className="text-center py-4 text-sm text-gray-500">Đang tải...</div>
              ) : newCustomers.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">Không có conversation mới</div>
              ) : (
                newCustomers.map((c) => (
                  <div key={c.id} className="w-full p-2 rounded-xl mb-1.5 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full mr-2 object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 font-semibold mr-2 text-sm" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>{c.name.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium" style={{ color: '#014091' }}>{c.name}</p>
                        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{c.time}</p>
                      </div>
                    </div>
                    <p className="text-xs mt-1 truncate" style={{ color: '#5f6777' }}>{c.lastMessage}</p>
                    <button onClick={() => acceptNew(c.id)} className="mt-2 w-full text-xs px-2 py-1 rounded-md hover:opacity-90 transition-opacity" style={{ backgroundColor: '#014091', color: 'white' }}>Accept</button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Left: Assigned conversations list */}
        <aside className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0 h-screen" style={{ backgroundColor: '#f8fafc' }}>
          {/* Header - Fixed */}
          <div className="p-3 flex items-center space-x-2 flex-shrink-0">
            {!showNew && (
              <button onClick={() => setShowNew(true)} className="text-[10px] px-2 py-1 rounded-md border hover:bg-gray-50" style={{ borderColor: '#8abdfe', color: '#014091' }}>Tin nhắn mới ({newCustomers.length})</button>
            )}
            <input
              placeholder="Tìm kiếm người dùng"
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb', boxShadow: '0 0 0 2px rgba(9,145,243,0.0)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {isLoadingAssigned ? (
              <div className="text-center py-4 text-sm text-gray-500">Đang tải...</div>
            ) : assigned.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">Không có conversation đã nhận</div>
            ) : (
              assigned.map((c) => {
                const active = c.id === activeId;
                return (
                  <button key={c.id} onClick={() => {
                    setActiveId(c.id);
                    loadConversationAndMessages(c.id);
                  }} className={`w-full flex items-center p-2 rounded-xl mb-1.5 text-left transition-colors ${active ? 'text-white' : ''}`} style={{ backgroundColor: active ? '#014091' : 'white', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}>
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className={`w-10 h-10 rounded-full mr-3 object-cover ${active ? 'ring-2 ring-white' : ''}`} />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm font-semibold ${active ? '' : 'text-gray-600'}`} style={{ backgroundColor: active ? 'white' : '#8abdfe', color: active ? '#014091' : '#014091' }}>{c.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`truncate text-sm font-medium ${active ? '' : ''}`} style={{ color: active ? 'white' : '#014091' }}>{c.name}</p>
                        <span className={`text-[10px]`} style={{ color: active ? '#8dcdfa' : '#9CA3AF' }}>{c.time}</span>
                      </div>
                      <p className={`truncate text-xs`} style={{ color: active ? '#8dcdfa' : '#5f6777' }}>{c.lastMessage}</p>
                    </div>
                    {c.unread && (
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full`} style={{ backgroundColor: active ? 'white' : '#8dcdfa', color: active ? '#014091' : '#014091' }}>{c.unread}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Middle: messages */}
        <section className="flex-1 flex flex-col h-screen min-w-0" style={{ backgroundColor: '#f8fafc' }}>
          {/* Header - Fixed */}
          {activeConversation && (
            <div className="p-3 border-b bg-white flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center cursor-pointer hover:opacity-90 focus:outline-none"
                title="Xem thông tin khách hàng"
              >
                {(() => {
                  const userID = typeof activeConversation.userID === 'string' ? null : activeConversation.userID;
                  const userName = userID?.fullName || userID?.userName || 'Unknown';
                  const userAvatar = userID?.photoURL;
                  
                  return (
                    <>
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full mr-2 object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold mr-2" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: '#014091' }}>{userName}</p>
                      </div>
                    </>
                  );
                })()}
              </button>
            </div>
          )}

          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-gray-500">Đang tải tin nhắn...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-gray-500">Chưa có tin nhắn nào</div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <Bubble key={m.id} item={m} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Composer - Fixed */}
          {activeConversation && (
            <div className="border-t bg-white flex flex-col flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
              {/* Image Preview - Fixed */}
              {imagePreviews.length > 0 && (
                <div className="p-2 border-b bg-gray-50 overflow-x-auto flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex items-center gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 flex items-center space-x-2 flex-shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isSending || isUploadingImage || !activeConversation}
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border"
                   style={{ backgroundColor: '#8dcdfa', borderColor: '#014091' }}
                   title="Chọn ảnh"
                 >
                   <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth={2}
                     stroke="currentColor"
                     className="w-5 h-5"
                     style={{ color: '#014091' }}
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25v-9.176c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                     />
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                     />
                   </svg>
                 </button>
                <input
                  className="flex-1 text-sm px-3 py-2 rounded-full border focus:outline-none focus:ring-2"
                  placeholder="Nhập tin nhắn của bạn..."
                  style={{ borderColor: '#e5e7eb' }}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && (inputMessage.trim() || selectedImages.length > 0) && !isSending && !isUploadingImage) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending || isUploadingImage || !activeConversation}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!inputMessage.trim() && selectedImages.length === 0) || isSending || isUploadingImage || !activeConversation}
                  className="px-3 py-2 rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#014091' }}
                >
                  {isUploadingImage ? 'Đang upload...' : isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right: slide-in customer details */}
        {showDetails && activeConversation && (
          <aside className="w-80 border-l bg-white flex flex-col flex-shrink-0 h-screen" style={{ borderColor: '#e5e7eb' }}> 
            {/* Header - Fixed */}
            <div className="p-3 flex items-center justify-between flex-shrink-0 border-b" style={{ borderColor: '#e5e7eb' }}>
              <p className="text-sm font-semibold" style={{ color: '#014091' }}>Thông tin chi tiết</p>
              <button onClick={() => setShowDetails(false)} className="text-xs hover:opacity-80" style={{ color: '#0991f3' }}>Đóng</button>
            </div>
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              {(() => {
                const userID = typeof activeConversation.userID === 'string' ? null : activeConversation.userID;
                const userName = userID?.fullName || userID?.userName || 'Unknown';
                const userEmail = userID?.email || '';
                const userAvatar = userID?.photoURL;
                
                return (
                  <>
                    <div className="flex items-center mb-3">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-full mr-3 object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold mr-3" style={{ backgroundColor: '#8abdfe', color: '#014091' }}>
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm" style={{ color: '#014091' }}>{userName}</p>
                        <p className="text-xs" style={{ color: '#5f6777' }}>{userEmail}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs" style={{ color: '#5f6777' }}>
                      <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                        <p className="font-medium text-sm mb-2" style={{ color: '#014091' }}>Thông tin đoạn chat</p>
                        <p className="mt-1">Trạng thái: <span className="font-semibold">{activeConversation.status}</span></p>
                        <p>Tạo lúc: {formatTimeAgo(activeConversation.createdAt)}</p>
                      </div>
                      
                      <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                        <p className="font-medium text-sm mb-2" style={{ color: '#014091' }}>Danh sách xe</p>
                        {isLoadingVehicles ? (
                          <div className="text-center py-2 text-xs text-gray-500">Đang tải...</div>
                        ) : customerVehicles.length === 0 ? (
                          <div className="text-center py-2 text-xs text-gray-500">Không có xe nào</div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {customerVehicles.map((vehicle) => (
                              <div key={vehicle._id} className="p-2 bg-white border rounded-md" style={{ borderColor: '#e5e7eb' }}>
                                <p className="font-semibold text-xs" style={{ color: '#014091' }}>
                                  {vehicle.brand} - {vehicle.plateNumber}
                                </p>
                                <p className="text-[10px] mt-1" style={{ color: '#5f6777' }}>
                                  {vehicle.vehicleCategory === 'CAR' ? 'Ô tô' : vehicle.vehicleCategory === 'MOTOBIKE' ? 'Xe máy' : 'Xe đạp'}
                                  {vehicle.VIN && ` • VIN: ${vehicle.VIN}`}
                                </p>
                                <p className="text-[10px]" style={{ color: '#5f6777' }}>
                                  Năm: {vehicle.year} • Km: {vehicle.mileage.toLocaleString()}
                                </p>
                                <p className="text-[10px]" style={{ color: '#5f6777' }}>
                                  Pin: {vehicle.batteryCapacity}% • Trạng thái: <span className="font-semibold">{vehicle.status === 'active' ? 'Hoạt động' : vehicle.status === 'inactive' ? 'Không hoạt động' : vehicle.status === 'maintenance' ? 'Bảo trì' : 'Ngừng sử dụng'}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ChatWithCustomer;