import React, { useState } from 'react';

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
  attachmentUrl?: string;
}

const mockNewCustomers: Conversation[] = [
  { id: 'n1', name: 'John Doe', lastMessage: 'I need help with...', time: '2m ago' },
  { id: 'n2', name: 'Jane Smith', lastMessage: 'Question about...', time: '5m ago' },
  { id: 'n3', name: 'Alex Lee', lastMessage: 'Issue with order...', time: '8m ago' },
];

const mockConversations: Conversation[] = [
  { id: '1', name: 'Penny Valeria', lastMessage: 'See you!', time: '12:35' },
  { id: '2', name: 'Pharah House', lastMessage: 'sent', time: '12:30', unread: 1 },
  { id: '3', name: 'Leonard Kayle', lastMessage: 'Okay, thanks!', time: '11:53' },
  { id: '4', name: 'Leslie Winkle', lastMessage: 'Hello, I have...', time: '11:21' },
  { id: '5', name: 'Richard Hammon', lastMessage: "We'll proceed...", time: '10:59' },
];

const mockMessages: MessageItem[] = [
  { id: 'm1', fromMe: false, text: 'We need to make sure that the product works well at every circumstance that fit with it', time: '10:15' },
  { id: 'm2', fromMe: true, text: 'Thanks and checking👍', time: '10:15' },
  { id: 'm3', fromMe: false, text: 'Sending you the files and docs within few moments. Meanwhile check our websites for insights.', time: '10:16' },
  { id: 'm4', fromMe: false, attachmentUrl: 'https://example.com/proposal.pdf', time: '10:17' },
  { id: 'm5', fromMe: false, text: "Quick glimpse of our proposal, when you're proposing the next meeting. We'll revise and go through with counter offer that you'll be offering.", time: '10:20' },
];

const Bubble: React.FC<{ item: MessageItem }> = ({ item }) => {
  const base = 'max-w-[75%] px-3 py-2 rounded-2xl text-sm';
  if (item.fromMe) {
    return (
      <div className="flex justify-end mb-2">
        <div className={`${base}`} style={{ backgroundColor: '#f6ae2d' }}>
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
    <div className="flex justify-start mb-2">
      <div className={`${base} bg-white shadow-sm border border-gray-100`}>
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
  const [activeId, setActiveId] = useState<string>(mockConversations[1].id);
  const [assigned, setAssigned] = useState<Conversation[]>(mockConversations);
  const [newCustomers, setNewCustomers] = useState<Conversation[]>(mockNewCustomers);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false); // default hidden

  const acceptNew = (id: string) => {
    const picked = newCustomers.find((c) => c.id === id);
    if (!picked) return;
    setAssigned((prev) => [{ id: `a-${Date.now()}`, name: picked.name, lastMessage: picked.lastMessage, time: 'now' }, ...prev]);
    setNewCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // width classes based on visibility
  const assignedWidthClass = 'col-span-3';
  const chatWidthClass = showDetails
    ? (showNew ? 'col-span-4' : 'col-span-6')
    : (showNew ? 'col-span-7' : 'col-span-9');

  return (
    <div className="h-screen bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 h-full">
        {/* Far Left: New Customers (toggleable) */}
        {showNew && (
          <aside className="col-span-2 border-r border-gray-100 flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: '#014091' }}>🆕 New Customers ({newCustomers.length})</p>
              <button onClick={() => setShowNew(false)} className="text-[10px] px-2 py-1 rounded-md border hover:bg-gray-50" style={{ borderColor: '#8abdfe', color: '#014091' }}>Hide</button>
            </div>
            <div className="overflow-auto px-2 pb-2">
              {newCustomers.map((c) => (
                <div key={c.id} className="w-full p-2 rounded-xl mb-1.5 bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 font-semibold mr-2 text-sm" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>{c.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: '#014091' }}>{c.name}</p>
                      <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{c.time}</p>
                    </div>
                  </div>
                  <p className="text-xs mt-1 truncate" style={{ color: '#5f6777' }}>{c.lastMessage}</p>
                  <button onClick={() => acceptNew(c.id)} className="mt-2 w-full text-xs px-2 py-1 rounded-md" style={{ backgroundColor: '#014091', color: 'white' }}>Accept</button>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Left: Assigned conversations list */}
        <aside className={`${assignedWidthClass} border-r border-gray-100 flex flex-col`} style={{ backgroundColor: '#f8fafc' }}>
          <div className="p-3 flex items-center space-x-2">
            {!showNew && (
              <button onClick={() => setShowNew(true)} className="text-[10px] px-2 py-1 rounded-md border hover:bg-gray-50" style={{ borderColor: '#8abdfe', color: '#014091' }}>Show New ({newCustomers.length})</button>
            )}
            <input placeholder="Search" className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: '#e5e7eb', boxShadow: '0 0 0 2px rgba(9,145,243,0.0)' }} />
          </div>
          <div className="overflow-auto px-2 pb-2">
            {assigned.map((c) => {
              const active = c.id === activeId;
              return (
                <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full flex items-center p-2 rounded-xl mb-1.5 text-left transition-colors ${active ? 'text-white' : ''}`} style={{ backgroundColor: active ? '#014091' : 'white', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm font-semibold ${active ? '' : 'text-gray-600'}`} style={{ backgroundColor: active ? 'white' : '#8abdfe', color: active ? '#014091' : '#014091' }}>{c.name.charAt(0)}</div>
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
            })}
          </div>
        </aside>

        {/* Middle: messages */}
        <section className={`${chatWidthClass} flex flex-col transition-all duration-300`} style={{ backgroundColor: '#f8fafc' }}>
          {/* Header */}
          <div className="p-3 border-b bg-white flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center cursor-pointer hover:opacity-90 focus:outline-none"
              title="Xem thông tin khách hàng"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold mr-2" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>P</div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: '#014091' }}>Pharah House</p>
              </div>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-3">
            {mockMessages.map((m) => (
              <Bubble key={m.id} item={m} />
            ))}
          </div>

          {/* Composer */}
          <div className="p-3 border-t bg-white" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center space-x-2">
              <input className="flex-1 text-sm px-3 py-2 rounded-full border focus:outline-none focus:ring-2" placeholder="Type your message..." style={{ borderColor: '#e5e7eb' }} />
              <button className="px-3 py-2 rounded-full text-white" style={{ backgroundColor: '#014091' }}>Send</button>
            </div>
          </div>
        </section>

        {/* Right: slide-in customer details */}
        {showDetails && (
          <aside className={`col-span-3 border-l bg-white transition-all duration-300 overflow-hidden`} style={{ borderColor: '#e5e7eb' }}> 
            <div className="h-full p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: '#014091' }}>Customer</p>
                <button onClick={() => setShowDetails(false)} className="text-xs hover:opacity-80" style={{ color: '#0991f3' }}>Close</button>
              </div>
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold mr-3" style={{ backgroundColor: '#8abdfe', color: '#014091' }}>P</div>
                <div>
                  <p className="text-sm" style={{ color: '#014091' }}>Pharah House</p>
                  <p className="text-xs" style={{ color: '#5f6777' }}>pharah@example.com</p>
                </div>
              </div>
              <div className="space-y-2 text-xs" style={{ color: '#5f6777' }}>
                <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                  <p className="font-medium text-sm" style={{ color: '#014091' }}>Notes</p>
                  <p>Sending you the files and docs within few moments.</p>
                </div>
                <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                   <p className="font-medium text-sm" style={{ color: '#014091' }}>Quick actions</p>
                   <div className="mt-2 grid grid-cols-2 gap-2">
                     <button className="px-2 py-1 rounded-md border hover:bg-gray-50" style={{ borderColor: '#8abdfe', color: '#014091' }}>Proposal</button>
                     <button className="px-2 py-1 rounded-md border hover:bg-gray-50" style={{ borderColor: '#8abdfe', color: '#014091' }}>Update Doc</button>
                   </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ChatWithCustomer;