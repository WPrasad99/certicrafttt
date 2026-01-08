import React, { useState, useEffect, useRef } from 'react';
import { collaborationService, messageService, authService } from '../services/authService';
import './MessagesTab.css';

function MessagesTab({ eventId, event, isOwner }) {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // Each chat has its own message bar state
    const [chatInputs, setChatInputs] = useState({ 'announcements': '' });
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeChat, setActiveChat] = useState(null); // null = Announcements, or userId
    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef(null);

    const activeChatKey = activeChat || 'announcements';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadMembers();
    }, [eventId]);

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [eventId, activeChat]);

    const loadMembers = async () => {
        try {
            const collaborators = await collaborationService.getCollaborators(eventId);
            const acceptedCollaborators = Array.isArray(collaborators) ? collaborators.filter(c => c.status === 'ACCEPTED') : [];

            const membersList = [];

            // Add Owner if not current user
            if (event.organizerId !== currentUser.id) {
                membersList.push({
                    userId: event.organizerId,
                    name: event.organizerName || 'Organizer',
                    email: event.organizerEmail || '',
                    role: 'OWNER'
                });
            }

            // Add accepted collaborators
            acceptedCollaborators.forEach(c => {
                if (c.id !== currentUser.id) {
                    membersList.push({
                        userId: c.id,
                        name: c.name, // Will be User.fullName from backend
                        email: c.email,
                        role: c.role
                    });
                }
            });

            setMembers(membersList);
        } catch (error) {
            console.error('Failed to load members:', error);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await messageService.getMessages(eventId, activeChat);
            if (Array.isArray(data)) {
                const mappedData = data.map(m => ({
                    ...m,
                    content: m.text,
                    senderName: m.sender,
                    isRead: m.isRead || false
                }));
                setMessages(mappedData);

                const unreadCount = mappedData.filter(m => !m.isRead && Number(m.senderId) !== Number(currentUser.id)).length;
                if (unreadCount > 0) {
                    await messageService.markAsRead(eventId);
                }
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = chatInputs[activeChatKey] || '';
        if (!content.trim()) return;

        setLoading(true);
        try {
            const res = await messageService.sendMessages({
                eventId,
                text: content,
                receiverId: activeChat
            });
            // Clear only for the current chat
            setChatInputs(prev => ({ ...prev, [activeChatKey]: '' }));
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (val) => {
        setChatInputs(prev => ({ ...prev, [activeChatKey]: val }));
    };

    const filteredMembers = searchTerm.trim()
        ? members.filter(m =>
            (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : members;

    const getAvatarColor = (name) => {
        const colors = ['#00a884', '#1f7aec', '#d43b2f', '#7e2dcf', '#aa831b'];
        let hash = 0;
        if (!name) return colors[0];
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getChatTitle = () => {
        if (!activeChat) return "Announcements";
        const member = members.find(m => m.userId === activeChat);
        return member ? member.name : "Team Member";
    };

    return (
        <div className="messages-tab">
            <div className="members-sidebar">
                <div className="sidebar-header">
                    <h3>Team Members</h3>
                </div>

                <div className="search-bar-container">
                    <div className="search-input-wrapper">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input
                            type="text"
                            placeholder="Search team members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="members-list">
                    <div
                        className={`member-item ${activeChat === null ? 'active' : ''}`}
                        onClick={() => setActiveChat(null)}
                    >
                        <div className="avatar" style={{ backgroundColor: '#00a884' }}>
                            <i className="fa-solid fa-bullhorn" style={{ fontSize: '14px' }}></i>
                        </div>
                        <div className="member-info">
                            <div className="member-name">Announcements</div>
                            <div className="member-status">Team Group Chat</div>
                        </div>
                    </div>

                    {filteredMembers.map((member, index) => (
                        <div
                            key={index}
                            className={`member-item ${activeChat === member.userId ? 'active' : ''}`}
                            onClick={() => setActiveChat(member.userId)}
                        >
                            <div className="avatar" style={{ backgroundColor: getAvatarColor(member.name) }}>
                                {member.name ? member.name.charAt(0).toUpperCase() : (member.email ? member.email.charAt(0).toUpperCase() : '?')}
                            </div>
                            <div className="member-info">
                                <div className="member-name">
                                    {member.name || member.email}
                                    {member.role === 'OWNER' && <span className="role-badge">Owner</span>}
                                </div>
                                <div className="member-status">
                                    {member.name ? member.email : 'Team Member'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-area">
                <div className="chat-header">
                    <div className="avatar" style={{ backgroundColor: '#00a884', width: '40px', height: '40px', fontSize: '18px' }}>
                        {activeChat ? <i className="fa-solid fa-user"></i> : <i className="fa-solid fa-bullhorn"></i>}
                    </div>
                    <div className="chat-title">
                        <h3>{event.eventName}</h3>
                        <div className="chat-subtitle">{getChatTitle()}</div>
                    </div>
                </div>

                <div className="messages-container">
                    {messages.length === 0 && (
                        <div className="empty-chat-placeholder">
                            <p>No messages yet in this chat.</p>
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const isSent = Number(msg.senderId) === Number(currentUser.id);
                        return (
                            <div key={index} className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
                                {!isSent && !activeChat && (
                                    <div className="message-sender-name" style={{ color: getAvatarColor(msg.senderName) }}>
                                        {msg.senderName || 'Anonymous'}
                                    </div>
                                )}
                                <div>{msg.content}</div>
                                <div className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isSent && (
                                        <i className={`fa-solid fa-check-double done-all-icon ${msg.isRead ? 'read' : ''}`} style={{ color: msg.isRead ? '#53bdeb' : '#8696a0' }}></i>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <form onSubmit={handleSendMessage} className="input-wrapper" style={{ margin: '0 10px 0 0' }}>
                        <input
                            type="text"
                            placeholder={activeChat ? `Message ${getChatTitle()}...` : "Send an announcement..."}
                            value={chatInputs[activeChatKey] || ''}
                            onChange={(e) => handleInputChange(e.target.value)}
                        />
                    </form>

                    <button onClick={handleSendMessage} className="btn-send-round" disabled={!(chatInputs[activeChatKey] || '').trim()}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MessagesTab;
