import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Message {
  id: string;
  sender: string; // user id
  recipient?: string | null; // admin id or undefined
  content: string;
  created_at: string;
}

export default function CustomerServiceScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for keyboard (to avoid message area covered)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Fetch admin ID on mount only (if possible)
  useEffect(() => {
    const getAdmin = async () => {
      const { data } = await supabase.from('users').select('id').eq('role', 'admin').maybeSingle();
      setAdminId(data?.id ?? null);
    };
    getAdmin();
  }, []);

  // Fetch messages between user and admin, or all user messages if no admin
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    async function loadMessages() {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      // Users see their own sent messages and any reply
      // If adminId exists, only filter for this admin
      if (adminId) {
        query = query.or(`and(sender.eq.${user.id},recipient.eq.${adminId}),and(sender.eq.${adminId},recipient.eq.${user.id})`);
      } else {
        query = query.or(`and(sender.eq.${user.id})`); // all messages sent by this user
      }
      const { data } = await query;
      if (isMounted && data) setMessages(data as Message[]);
    }
    loadMessages();
    pollingRef.current = setInterval(() => loadMessages(), 4000);
    return () => { isMounted = false; if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user?.id, adminId]);

  // Scroll to end on message update/keyboard
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages, keyboardVisible]);

  // Send message and persist to Supabase
  const onSend = async () => {
    if (!message.trim() || !user?.id) return;
    setSending(true);
    setSendError(null);
    const newMsg = {
      sender: user.id,
      recipient: adminId ?? null,
      content: message,
    };
    setMessage('');
    try {
      const { error } = await supabase.from('messages').insert(newMsg);
      if (error) {
        // check if error is about recipient being null
        if (error.message.toLowerCase().includes('null') && error.message.toLowerCase().includes('recipient')) {
          setSendError(
            "There is currently no admin available. Your message could not be saved. Please try again later or contact support."
          );
        } else {
          setSendError(null);
          Alert.alert('Send Failed', 'Could not send message (connection/database error).');
        }
      } else {
        setSendError(null);
        // Refresh messages immediately after send
        let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
        if (adminId) {
          query = query.or(`and(sender.eq.${user.id},recipient.eq.${adminId}),and(sender.eq.${adminId},recipient.eq.${user.id})`);
        } else {
          query = query.or(`and(sender.eq.${user.id})`);
        }
        const { data } = await query;
        if (data) setMessages(data as Message[]);
      }
    } finally {
      setSending(false);
    }
  };

  const renderMsg = ({ item }: { item: Message }) => {
    const isUser = item.sender === user?.id;
    return (
      <View
        style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAdmin]}
      >
        <View
          style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAdmin]}
        >
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAdmin]}>{item.content}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUser ? (
          <Ionicons name="person-circle" size={28} color="#0a7ea4" style={{ marginLeft: 4 }} />
        ) : (
          <Ionicons name="shield-checkmark" size={27} color="#719096" style={{ marginRight: 4 }} />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#E9F1F6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={110}
    >
      <View style={styles.container}>
        <ThemedText type="title" style={styles.header}>Customer Service</ThemedText>
        {!user?.id && (
          <ThemedText style={[styles.subtitle, { color: '#cd3636', fontWeight: 'bold', marginBottom: 24 }] }>
            Please log in to send a message.
          </ThemedText>
        )}
        {user?.id && messages.length === 0 && (
          <ThemedText style={styles.subtitle}>
            Message our admin for inquiries or support. Someone will get back to you soon.
          </ThemedText>
        )}
        <View style={[styles.chatArea, keyboardVisible && { paddingBottom: 32 }, { flex: 1 }]}> 
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMsg}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={user?.id ? "Type your message..." : "Login required to message"}
            placeholderTextColor="#a6a6a6"
            value={message}
            onChangeText={setMessage}
            editable={!sending && !!user?.id}
            multiline
            onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 180)}
          />
          <Pressable
            style={({ pressed }) => [styles.sendButton, (!message.trim() || sending || !user?.id) && styles.sendButtonDisabled, pressed && { opacity: 0.85 }]}
            onPress={onSend}
            disabled={!message.trim() || sending || !user?.id}
          >
            <Ionicons name="send" size={21} color="#fff" />
          </Pressable>
        </View>
        {sendError ? (
          <Text style={{ color: '#e74c3c', marginBottom: 10, textAlign: 'center', fontSize: 13 }}>{sendError}</Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#E9F1F6',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 2,
    marginLeft: 4,
  },
  subtitle: {
    color: '#6a8495',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 19,
    paddingHorizontal: 2,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f5fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e6ea',
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'flex-end',
  },
  chatContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
    gap: 3,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  msgRowAdmin: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  bubble: {
    maxWidth: '83%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
    marginBottom: 2,
  },
  bubbleUser: {
    backgroundColor: '#0b91cc',
    borderBottomRightRadius: 5,
  },
  bubbleAdmin: {
    backgroundColor: '#d5ecfd',
    borderBottomLeftRadius: 5,
  },
  msgText: {
    fontSize: 15,
    marginBottom: 2,
  },
  msgTextUser: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
  },
  msgTextAdmin: {
    color: '#19304a',
    textAlign: 'left',
  },
  timestamp: {
    fontSize: 11,
    color: '#7492a9',
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    padding: 3,
    backgroundColor: '#f5fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e6ea',
    marginVertical: 3,
  },
  input: {
    fontSize: 16,
    color: '#123B4A',
    flex: 1,
    minHeight: 38,
    maxHeight: 92,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#b3d2e3',
  },
});
