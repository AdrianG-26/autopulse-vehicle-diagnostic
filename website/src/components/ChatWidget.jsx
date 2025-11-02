import React, { useEffect, useRef, useState } from 'react';
import { loadConversation, sendMessage, subscribeConversation } from '../services/chat';

export default function ChatWidget({ currentUsername, adminUsername = 'admin', recipientOverride = '', embedded = false }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsAdmin(currentUsername === adminUsername);
        const forcedOther = recipientOverride && currentUsername ? (currentUsername === adminUsername ? recipientOverride : adminUsername) : '';
        if (forcedOther) {
          const data = await loadConversation({ user: currentUsername, other: forcedOther, limit: 200 });
          setMessages(data);
          if (currentUsername === adminUsername) setSelectedUser(recipientOverride);
        } else if (currentUsername === adminUsername) {
          // Admin: show recent distinct users who messaged admin
          const { supabase } = await import('../services/supabase');
          const { data: rows } = await supabase
            .from('messages')
            .select('sender,recipient,created_at')
            .or(`sender.eq.${adminUsername},recipient.eq.${adminUsername}`)
            .order('created_at', { ascending: false })
            .limit(50);
          const users = [];
          const seen = new Set();
          (rows || []).forEach((r) => {
            const other = r.sender === adminUsername ? r.recipient : r.sender;
            if (other && !seen.has(other)) { seen.add(other); users.push(other); }
          });
          setRecentUsers(users);
          if (users[0]) {
            setSelectedUser(users[0]);
            const data = await loadConversation({ user: adminUsername, other: users[0], limit: 200 });
            setMessages(data);
          }
        } else {
          const data = await loadConversation({ user: currentUsername, other: adminUsername, limit: 200 });
          setMessages(data);
        }
      } catch (e) {
        // ignore if supabase not configured
      }
    };
    init();
  }, [currentUsername, adminUsername, recipientOverride]);

  // Load messages when admin selects a different user
  useEffect(() => {
    const loadUserMessages = async () => {
      if (isAdmin && selectedUser) {
        try {
          console.log(`Loading messages for admin ${adminUsername} with user ${selectedUser}`);
          const data = await loadConversation({ user: adminUsername, other: selectedUser, limit: 200 });
          console.log(`Loaded ${data.length} messages for ${selectedUser}:`, data);
          setMessages(data);
        } catch (e) {
          console.error('Error loading user messages:', e);
        }
      }
    };
    loadUserMessages();
  }, [isAdmin, selectedUser, adminUsername]);

  useEffect(() => {
    const other = recipientOverride ? (currentUsername === adminUsername ? recipientOverride : adminUsername) : (isAdmin ? (selectedUser || '') : adminUsername);
    if (!other) return () => {};
    const unsub = subscribeConversation({ user: currentUsername, other, onMessage: (row) => {
      setMessages((prev) => [...prev, row]);
    }});
    return () => unsub();
  }, [currentUsername, adminUsername, isAdmin, selectedUser, recipientOverride]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to format date for display
  const formatDateSeparator = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const resetTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const msgDate = resetTime(messageDate);
    const todayDate = resetTime(today);
    const yesterdayDate = resetTime(yesterday);

    if (msgDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (msgDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  // Check if we should show date separator
  const shouldShowDateSeparator = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.created_at);
    const previousDate = new Date(previousMsg.created_at);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    try {
      const recipient = recipientOverride ? (currentUsername === adminUsername ? recipientOverride : adminUsername) : (isAdmin ? selectedUser : adminUsername);
      await sendMessage({ sender: currentUsername, recipient, content });
      setText('');
    } catch (e) {
      // optionally show error
    }
  };

  const handleDeleteChat = async (userToDelete) => {
    if (!isAdmin || !userToDelete) return;
    
    if (window.confirm(`Are you sure you want to delete all messages with ${userToDelete}? This action cannot be undone.`)) {
      try {
        const { supabase } = await import('../services/supabase');
        
        // Delete all messages between admin and the selected user
        const { error } = await supabase
          .from('messages')
          .delete()
          .or(`and(sender.eq.${adminUsername},recipient.eq.${userToDelete}),and(sender.eq.${userToDelete},recipient.eq.${adminUsername})`);
        
        if (error) {
          console.error('Error deleting messages:', error);
          alert('Failed to delete messages. Please try again.');
          return;
        }
        
        // Remove user from recent users list
        setRecentUsers(prev => prev.filter(user => user !== userToDelete));
        
        // If the deleted user was selected, clear the selection and messages
        if (selectedUser === userToDelete) {
          setSelectedUser('');
          setMessages([]);
        }
        
        alert(`All messages with ${userToDelete} have been deleted.`);
      } catch (e) {
        console.error('Failed to delete messages:', e);
        alert('Failed to delete messages. Please try again.');
      }
    }
  };

  if (embedded) {
    return (
      <>
        <style>
          {`
            .chat-widget *::-webkit-scrollbar {
              display: none;
            }
            .chat-widget * {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
        <div className="chat-widget" style={{ 
          display: 'flex', 
          height: 'calc(100vh - 200px)', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Left sidebar for admin user selection */}
          {isAdmin && (
            <div style={{ 
              width: '300px', 
              borderRight: '1px solid #e5e7eb', 
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#3b82f6',
                color: 'white'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Messages</h3>
              </div>

              {/* User list */}
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {recentUsers.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    color: '#6b7280', 
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    No conversations
                  </div>
                ) : (
                  recentUsers.map(user => (
                    <div
                      key={user}
                      style={{
                        padding: '12px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: selectedUser === user ? '#dbeafe' : 'transparent',
                        color: selectedUser === user ? '#1d4ed8' : '#374151',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div 
                        onClick={() => setSelectedUser(user)}
                        style={{
                          flex: 1,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: selectedUser === user ? '#3b82f6' : '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {user.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{user}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(user);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title="Delete conversation"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Main chat area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  {isAdmin ? (selectedUser ? selectedUser.charAt(0).toUpperCase() : 'A') : 'A'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {isAdmin ? (selectedUser ? selectedUser : 'Select a user') : 'Admin'}
                  </h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                    {isAdmin ? 'User' : 'System Administrator'}
                  </p>
                </div>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981' 
                }}></div>
                Online
              </div>
            </div>

            {/* Messages area */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '20px 24px',
              backgroundColor: '#fafafa',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  marginTop: '40px',
                  fontSize: '14px'
                }}>
                  {isAdmin && !selectedUser ? 'Select a user to view messages' : 'No messages yet. Start the conversation!'}
                </div>
              ) : (
                messages.map((m, index) => {
                  const mine = m.sender === currentUsername;
                  const showDateSeparator = shouldShowDateSeparator(m, messages[index - 1]);
                  
                  return (
                    <React.Fragment key={m.id || m.created_at + Math.random()}>
                      {/* Date Separator */}
                      {showDateSeparator && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '24px 0 16px 0'
                        }}>
                          <div style={{
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            padding: '6px 16px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}>
                            {formatDateSeparator(m.created_at)}
                          </div>
                        </div>
                      )}
                      
                      {/* Message */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: mine ? 'flex-end' : 'flex-start',
                          marginBottom: '16px'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: mine ? 'flex-end' : 'flex-start'
                        }}>
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            backgroundColor: mine ? '#3b82f6' : '#ffffff',
                            color: mine ? 'white' : '#374151',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            border: mine ? 'none' : '1px solid #e5e7eb'
                          }}>
                            {m.content}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#9ca3af',
                            marginTop: '4px',
                            padding: '0 8px'
                          }}>
                            {new Date(m.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div style={{ 
              padding: '20px 24px', 
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative', maxWidth: 'calc(100% - 100px)' }}>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isAdmin && !selectedUser ? "Select a user to chat..." : "Type your message..."}
                    disabled={isAdmin && !selectedUser}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '24px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: isAdmin && !selectedUser ? '#f3f4f6' : 'white',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={(isAdmin && !selectedUser) || !text.trim()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: (isAdmin && !selectedUser) || !text.trim() ? 'not-allowed' : 'pointer',
                    opacity: (isAdmin && !selectedUser) || !text.trim() ? 0.5 : 1,
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <span>Send</span>
                  <span style={{ fontSize: '12px' }}>→</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Fallback for non-embedded usage (floating widget)
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000 
    }}>
      <div style={{ 
        width: '350px', 
        height: '500px', 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          backgroundColor: '#3b82f6',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Contact Admin</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Get help instantly</p>
          </div>
          <button 
            onClick={() => {}} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#fff', 
              fontSize: '20px', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{ 
          flex: 1, 
          padding: '16px', 
          overflowY: 'auto', 
          backgroundColor: '#f8fafc' 
        }}>
          {messages.map((m, index) => {
            const mine = m.sender === currentUsername;
            const showDateSeparator = shouldShowDateSeparator(m, messages[index - 1]);
            
            return (
              <React.Fragment key={m.id || m.created_at + Math.random()}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '16px 0 12px 0'
                  }}>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      padding: '4px 12px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {formatDateSeparator(m.created_at)}
                    </div>
                  </div>
                )}
                
                {/* Message */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: mine ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: mine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    backgroundColor: mine ? '#3b82f6' : '#ffffff',
                    color: mine ? 'white' : '#374151',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    border: mine ? 'none' : '1px solid #e5e7eb'
                  }}>
                    {m.content}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb', 
          backgroundColor: 'white',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              maxWidth: 'calc(100% - 80px)'
            }}
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            style={{
              padding: '10px 18px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: !text.trim() ? 'not-allowed' : 'pointer',
              opacity: !text.trim() ? 0.5 : 1,
              fontSize: '13px',
              fontWeight: '500',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
