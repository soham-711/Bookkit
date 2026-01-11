import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, MoreVertical, Check, Send, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

interface OrderItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  status: 'picked-up' | 'delivered';
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
  options?: string[];
  isTyping?: boolean;
}

const SupportPage = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const orders: OrderItem[] = [
    {
      id: '1',
      date: '2025 September 12, 12:35 PM',
      title: 'Order Received',
      subtitle: 'NCERT Maths Edt 2024, From Soham Biswas',
      status: 'picked-up',
    },
    {
      id: '2',
      date: '2025 September 05, 10:35 PM',
      title: 'Order Delivered',
      subtitle: 'NCERT Maths Edt 2024, To Soham Biswas',
      status: 'delivered',
    },
    {
      id: '3',
      date: '2025 August 05, 10:35 PM',
      title: 'Order Delivered',
      subtitle: 'NCERT Science Edt 2024, To Soham',
      status: 'delivered',
    },
  ];

  const handleSelectIssue = (orderId: string, orderText: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: orderText,
      sender: 'user',
      time: currentTime,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = getOptionsForIssue(orderId);
      setMessages(prev => [...prev, aiResponse]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const getOptionsForIssue = (issueType: string): Message => {
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let text = '';
    let options: string[] = [];

    if (issueType === '1') {
      text = 'I see you have an issue with your received order. How can I help you with this?';
      options = [
        'Wrong item received',
        'Item is damaged',
        'Missing items in order',
        'Quality issue',
        'Other issue',
      ];
    } else if (issueType === '2' || issueType === '3') {
      text = 'I understand you have concerns about your delivered order. What seems to be the problem?';
      options = [
        'Item not as described',
        'Want to return the item',
        'Item is defective',
        'Request refund',
        'Other issue',
      ];
    } else if (issueType === 'other') {
      text = 'Let me help you with your previous orders. What would you like to know?';
      options = [
        'Track my order',
        'Order history',
        'Payment issues',
        'Delivery issues',
        'Cancel order',
      ];
    } else if (issueType === 'custom') {
      text = 'Please tell me more about your issue. How can I assist you today?';
      options = [
        'Account issues',
        'Payment problems',
        'Delivery concerns',
        'Book condition',
        'Other',
      ];
    }

    return {
      id: (Date.now() + 1).toString(),
      text,
      sender: 'support',
      time: currentTime,
      options,
    };
  };

  const handleCloseConversation = () => {
    Alert.alert(
      'Close Conversation',
      'Are you sure you want to close this conversation?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Close',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setShowTextInput(false);
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
          },
        },
      ]
    );
  };

  const handleOptionClick = (option: string) => {
    if (option === 'Close conversation') {
      handleCloseConversation();
      return;
    }

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
      time: currentTime,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = getResponseForOption(option);
      setMessages(prev => [...prev, aiResponse]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const getResponseForOption = (option: string): Message => {
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let text = '';
    let options: string[] = [];

    if (option === 'Wrong item received' || option === 'Item not as described') {
      text = 'I apologize for the inconvenience. We will help you resolve this. What would you like to do?';
      options = [
        'Exchange for correct item',
        'Request full refund',
        'Contact seller directly',
        'Speak to support agent',
      ];
    } else if (option === 'Item is damaged' || option === 'Item is defective') {
      text = 'I\'m sorry to hear that. We take product quality seriously. Let me help you with this.';
      options = [
        'Request replacement',
        'Get full refund',
        'Upload damage photos',
        'Talk to supervisor',
      ];
    } else if (option === 'Missing items in order') {
      text = 'Let me check your order details. We will send the missing items or provide a refund.';
      options = [
        'Send missing items',
        'Partial refund',
        'Check order status',
        'Contact delivery team',
      ];
    } else if (option === 'Quality issue' || option === 'Book condition') {
      text = 'We maintain high quality standards. Let me assist you with this quality concern.';
      options = [
        'Return for refund',
        'Exchange with new one',
        'Get compensation',
        'Report to quality team',
      ];
    } else if (option === 'Want to return the item' || option === 'Request refund') {
      text = 'I can help you initiate a return. The refund process takes 5-7 business days.';
      options = [
        'Start return process',
        'Check refund status',
        'Return policy details',
        'Schedule pickup',
      ];
    } else if (option === 'Track my order') {
      text = 'Your order tracking number is TRK123456789. Current status: In Transit.';
      options = [
        'See delivery timeline',
        'Change delivery address',
        'Contact delivery partner',
        'Report delivery issue',
      ];
    } else if (option === 'Cancel order') {
      text = 'I can help you cancel the order if it hasn\'t been shipped yet.';
      options = [
        'Proceed with cancellation',
        'Check cancellation status',
        'Modify order instead',
        'Keep the order',
      ];
    } else if (option === 'Payment problems' || option === 'Payment issues') {
      text = 'Let me help you resolve the payment issue. What specific problem are you facing?';
      options = [
        'Payment failed',
        'Amount deducted twice',
        'Refund not received',
        'Payment method issue',
      ];
    } else if (option === 'Delivery concerns' || option === 'Delivery issues') {
      text = 'I understand delivery is important. How can I help with the delivery?';
      options = [
        'Delivery delayed',
        'Wrong delivery address',
        'Delivery person issue',
        'Reschedule delivery',
      ];
    } else if (option === 'Account issues') {
      text = 'Let me help you with your account. What seems to be the issue?';
      options = [
        'Can\'t login',
        'Reset password',
        'Update profile',
        'Delete account',
      ];
    } else if (option === 'Other issue' || option === 'Other') {
      text = 'Please describe your issue in detail so I can assist you better.';
      setShowTextInput(true);
      return {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'support',
        time: currentTime,
      };
    } else {
      text = 'Thank you for providing the details. Your request has been recorded. Our team will get back to you within 24 hours.';
      options = [
        'Track this request',
        'Speak to agent now',
        'Close conversation',
        'Rate this chat',
      ];
    }

    return {
      id: (Date.now() + 1).toString(),
      text,
      sender: 'support',
      time: currentTime,
      options,
    };
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      time: currentTime,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setShowTextInput(false);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for the information. Our support team will review this and get back to you shortly.',
        sender: 'support',
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        options: [
          'Talk to agent',
          'Track request',
          'Close chat',
          'Ask something else',
        ],
      };
      setMessages(prev => [...prev, supportResponse]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const handleBack = () => {
    if (messages.length > 0) {
      Alert.alert(
        'Leave Chat',
        'Are you sure you want to leave this conversation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleClearInput = () => {
    setInputMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <LinearGradient
        colors={["#dcfbffff", "#f2fbfbff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#8be5f9ff" />
        
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Support Chat</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>Online - Quick reply</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('More Options', 'Feature coming soon!')}
            accessibilityLabel="More options"
            accessibilityRole="button"
          >
            <MoreVertical size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Improved Closed Notification */}
        <View style={styles.closedNotification}>
          <View style={styles.checkIconContainer}>
            <Check size={14} color="#D97706" strokeWidth={3} />
          </View>
          <Text style={styles.closedText}>
            This conversation has been closed
          </Text>
        </View>

        {/* Date Separator */}
        <View style={styles.todayContainer}>
          <View style={styles.dateSeparator}>
            <View style={styles.separatorLine} />
            <Text style={styles.todayText}>Today</Text>
            <View style={styles.separatorLine} />
          </View>
        </View>

        {/* Scrollable Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Message */}
          <View style={styles.messageContainer}>
            <View style={[styles.messageBubble, styles.firstMessage]}>
              <Text style={styles.messageText}>Hi Soham! 👋</Text>
              <Text style={styles.messageText}>I'm here to help you out</Text>
              <Text style={styles.messageTime}>12:50 PM</Text>
            </View>
          </View>

          {/* Initial Issue Selection */}
          {messages.length === 0 && (
            <View style={styles.messageContainer}>
              <View style={[styles.messageBubble, styles.issueMessage]}>
                <View style={styles.exbookBadge}>
                  <Text style={styles.exbookText}>EXBOOK SUPPORT</Text>
                </View>
                
                <Text style={styles.messageText}>
                  Please select the issue you are facing.
                </Text>
                <Text style={styles.messageText}>
                  We are here to help you out 😊
                </Text>

                <View style={styles.ordersContainer}>
                  {orders.map((order) => (
                    <TouchableOpacity
                      key={order.id}
                      style={styles.orderCard}
                      onPress={() => handleSelectIssue(order.id, `${order.title} - ${order.subtitle}`)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Select issue for ${order.title}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.orderDate}>{order.date}</Text>
                      <Text style={styles.orderTitle}>{order.title}</Text>
                      <Text style={styles.orderSubtitle}>{order.subtitle}</Text>
                      <View style={styles.statusBadge}>
                        <Text
                          style={[
                            styles.orderStatus,
                            order.status === 'picked-up'
                              ? styles.statusPickedUp
                              : styles.statusDelivered,
                          ]}
                        >
                          ● {order.status === 'picked-up' ? 'Picked up' : 'Delivered'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[styles.orderCard, styles.otherOrderCard]}
                    onPress={() => handleSelectIssue('other', 'Other previous orders')}
                    activeOpacity={0.7}
                    accessibilityLabel="Select other previous orders"
                    accessibilityRole="button"
                  >
                    <Text style={styles.orderDate}>📦 Other previous orders</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.orderCard, styles.otherOrderCard]}
                    onPress={() => handleSelectIssue('custom', 'My issue is not listed here')}
                    activeOpacity={0.7}
                    accessibilityLabel="My issue is not listed"
                    accessibilityRole="button"
                  >
                    <Text style={styles.orderDate}>
                      ✍️ My issue is not listed here
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <View key={message.id}>
              <View
                style={[
                  styles.chatMessageContainer,
                  message.sender === 'user' && styles.chatMessageContainerUser,
                ]}
              >
                <View
                  style={[
                    styles.chatBubble,
                    message.sender === 'user'
                      ? styles.chatBubbleUser
                      : styles.chatBubbleSupport,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatMessageText,
                      message.sender === 'user' && styles.chatMessageTextUser,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.chatTime,
                      message.sender === 'user' && styles.chatTimeUser,
                    ]}
                  >
                    {message.time}
                  </Text>
                </View>
              </View>

              {/* Quick Reply Options */}
              {message.sender === 'support' && message.options && (
                <View style={styles.optionsContainer}>
                  {message.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => handleOptionClick(option)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Select ${option}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.optionButtonText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#003EF9" />
                <Text style={styles.typingText}>Support is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Enhanced Input Area */}
        {showTextInput && (
          <View style={styles.chatInputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={500}
                accessibilityLabel="Message input field"
              />
              {inputMessage.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearInput}
                  accessibilityLabel="Clear message"
                  accessibilityRole="button"
                >
                  <X size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputMessage.trim() === '' && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={inputMessage.trim() === ''}
              activeOpacity={0.7}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <Send
                size={20}
                color={inputMessage.trim() === '' ? '#9CA3AF' : '#FFFFFF'}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Character Count for Input */}
        {showTextInput && inputMessage.length > 400 && (
          <View style={styles.characterCountContainer}>
            <Text style={styles.characterCount}>
              {inputMessage.length}/500
            </Text>
          </View>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (width: number, height: number) => {
  const s = (n: number) => (width / 375) * n;
  const vs = (n: number) => (height / 812) * n;
  const topPad = clamp(s(45), 24, 60);
  const sidePad = clamp(s(16), 12, 24);

  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sidePad,
      paddingTop: topPad,
      paddingBottom: clamp(s(16), 12, 20),
      backgroundColor: '#b1effdff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    headerButton: { 
      padding: clamp(s(8), 6, 10),
      borderRadius: clamp(s(8), 6, 10),
    },
    headerTextContainer: { 
      flex: 1, 
      marginLeft: clamp(s(12), 10, 16),
    },
    headerTitle: {
      fontSize: clamp(s(20), 18, 24),
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: clamp(s(2), 1, 3),
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(s(6), 4, 8),
    },
    onlineDot: {
      width: clamp(s(8), 6, 10),
      height: clamp(s(8), 6, 10),
      borderRadius: clamp(s(4), 3, 5),
      backgroundColor: '#10B981',
    },
    headerSubtitle: {
      fontSize: clamp(s(12), 11, 14),
      color: '#374151',
    },
    closedNotification: {
      backgroundColor: '#FEF3C7',
      marginHorizontal: sidePad,
      marginBottom: clamp(s(12), 10, 16),
      marginTop: clamp(s(16), 12, 20),
      paddingVertical: clamp(s(10), 8, 12),
      paddingHorizontal: clamp(s(16), 12, 20),
      borderRadius: clamp(s(12), 10, 14),
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: clamp(s(4), 3, 5),
      borderLeftColor: '#F59E0B',
    },
    checkIconContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: clamp(s(12), 10, 14),
      padding: clamp(s(2), 1, 3),
      marginRight: clamp(s(8), 6, 10),
    },
    closedText: {
      fontSize: clamp(s(13), 12, 15),
      color: '#92400E',
      fontWeight: '600',
    },
    todayContainer: { 
      alignItems: 'center', 
      paddingVertical: clamp(s(16), 12, 20),
    },
    dateSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(s(12), 10, 16),
    },
    separatorLine: {
      width: clamp(s(40), 30, 50),
      height: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    todayText: {
      fontSize: clamp(s(12), 11, 14),
      color: '#6B7280',
      fontWeight: '600',
      paddingHorizontal: clamp(s(12), 10, 16),
      paddingVertical: clamp(s(4), 3, 6),
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: clamp(s(12), 10, 14),
    },
    scrollView: { flex: 1 },
    scrollContent: {
      paddingHorizontal: sidePad,
      paddingBottom: clamp(vs(120), 100, 140),
    },
    messageContainer: { marginBottom: clamp(vs(16), 12, 20) },
    messageBubble: {
      backgroundColor: '#FFFFFF',
      borderRadius: clamp(s(16), 12, 20),
      borderTopLeftRadius: clamp(s(4), 3, 6),
      padding: clamp(s(16), 14, 20),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    firstMessage: {
      maxWidth: '85%',
      paddingVertical: clamp(s(14), 12, 18),
      paddingHorizontal: clamp(s(18), 16, 22),
    },
    issueMessage: { maxWidth: '95%' },
    messageText: {
      fontSize: clamp(s(14), 13, 16),
      color: '#1F2937',
      lineHeight: clamp(s(20), 18, 24),
      marginBottom: clamp(s(4), 3, 6),
      fontWeight: '500',
    },
    messageTime: {
      fontSize: clamp(s(11), 10, 13),
      color: '#9CA3AF',
      textAlign: 'right',
      marginTop: clamp(s(8), 6, 10),
      fontWeight: '500',
    },
    exbookBadge: {
      backgroundColor: '#DBEAFE',
      paddingHorizontal: clamp(s(14), 12, 18),
      paddingVertical: clamp(s(6), 5, 8),
      borderRadius: clamp(s(6), 5, 8),
      alignSelf: 'flex-start',
      marginBottom: clamp(s(12), 10, 16),
    },
    exbookText: {
      fontSize: clamp(s(11), 10, 13),
      color: '#1E40AF',
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    ordersContainer: { marginTop: clamp(vs(16), 12, 20) },
    orderCard: {
      backgroundColor: '#F9FAFB',
      borderRadius: clamp(s(12), 10, 14),
      padding: clamp(s(14), 12, 18),
      marginBottom: clamp(vs(10), 8, 12),
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    otherOrderCard: {
      backgroundColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    },
    orderDate: {
      fontSize: clamp(s(12), 11, 14),
      color: '#0066CC',
      fontWeight: '700',
      marginBottom: clamp(s(4), 3, 6),
    },
    orderTitle: {
      fontSize: clamp(s(13), 12, 15),
      color: '#0066CC',
      fontWeight: '600',
      marginBottom: clamp(s(2), 1, 3),
    },
    orderSubtitle: {
      fontSize: clamp(s(12), 11, 14),
      color: '#6B7280',
      marginBottom: clamp(vs(8), 6, 10),
      fontWeight: '500',
      lineHeight: clamp(s(18), 16, 20),
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    orderStatus: { 
      fontSize: clamp(s(12), 11, 14), 
      fontWeight: '700',
    },
    statusPickedUp: { color: '#059669' },
    statusDelivered: { color: '#DC2626' },
    chatMessageContainer: {
      marginBottom: clamp(vs(12), 10, 16),
      alignItems: 'flex-start',
    },
    chatMessageContainerUser: { alignItems: 'flex-end' },
    chatBubble: {
      maxWidth: '82%',
      borderRadius: clamp(s(18), 16, 22),
      padding: clamp(s(14), 12, 18),
    },
    chatBubbleSupport: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: clamp(s(4), 3, 6),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    chatBubbleUser: {
      backgroundColor: '#ffffffff',
      borderTopRightRadius: clamp(s(4), 3, 6),
      shadowColor: '#003EF9',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    chatMessageText: {
      fontSize: clamp(s(14), 13, 16),
      color: '#1F2937',
      lineHeight: clamp(s(20), 18, 24),
      fontWeight: '500',
    },
    chatMessageTextUser: { color: '#020b20ff' },
    chatTime: {
      fontSize: clamp(s(10), 9, 12),
      color: '#1F2937',
      marginTop: clamp(s(6), 4, 8),
      fontWeight: '500',
    },
    chatTimeUser: { 
      textAlign: 'right',
      color: '#1F2937',
    },
    typingContainer: {
      marginBottom: clamp(vs(12), 10, 16),
      alignItems: 'flex-start',
    },
    typingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(s(8), 6, 10),
      backgroundColor: '#FFFFFF',
      borderRadius: clamp(s(18), 16, 22),
      borderTopLeftRadius: clamp(s(4), 3, 6),
      paddingVertical: clamp(s(10), 8, 12),
      paddingHorizontal: clamp(s(14), 12, 18),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    typingText: {
      fontSize: clamp(s(13), 12, 15),
      color: '#6B7280',
      fontStyle: 'italic',
    },
    optionsContainer: {
      marginTop: clamp(vs(8), 6, 10),
      marginBottom: clamp(vs(12), 10, 16),
      paddingHorizontal: clamp(s(4), 2, 6),
      gap: clamp(vs(8), 6, 10),
    },
    optionButton: {
      backgroundColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#86a4ffff',
      borderRadius: clamp(s(24), 20, 28),
      paddingVertical: clamp(s(12), 10, 14),
      paddingHorizontal: clamp(s(18), 16, 22),
      alignSelf: 'flex-start',
      shadowColor: '#003ef9b1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    optionButtonText: {
      fontSize: clamp(s(13), 12, 15),
      color: '#050a1bff',
      fontWeight: '700',
    },
    chatInputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: sidePad,
      paddingVertical: clamp(s(14), 12, 18),
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 5,
    },
    inputWrapper: {
      flex: 1,
      position: 'relative',
    },
    chatInput: {
      backgroundColor: '#F9FAFB',
      borderRadius: clamp(s(24), 20, 28),
      paddingHorizontal: clamp(s(18), 16, 22),
      paddingVertical: clamp(s(12), 10, 14),
      paddingRight: clamp(s(40), 36, 48),
      fontSize: clamp(s(14), 13, 16),
      color: '#1F2937',
      maxHeight: clamp(vs(100), 80, 120),
      marginRight: clamp(s(10), 8, 12),
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      lineHeight: clamp(s(20), 18, 24),
    },
    clearButton: {
      position: 'absolute',
      right: clamp(s(22), 20, 28),
      top: '50%',
      transform: [{ translateY: -clamp(s(8), 6, 10) }],
      padding: clamp(s(4), 3, 6),
    },
    sendButton: {
      backgroundColor: '#b8c8fbff',
      width: clamp(s(48), 44, 56),
      height: clamp(s(48), 44, 56),
      borderRadius: clamp(s(24), 22, 28),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#003EF9',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    sendButtonDisabled: { 
      backgroundColor: '#D1D5DB',
      shadowOpacity: 0,
    },
    characterCountContainer: {
      position: 'absolute',
      bottom: clamp(vs(70), 60, 85),
      right: sidePad + clamp(s(20), 18, 24),
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: clamp(s(8), 6, 10),
      paddingVertical: clamp(s(4), 3, 6),
      borderRadius: clamp(s(12), 10, 14),
    },
    characterCount: {
      fontSize: clamp(s(10), 9, 12),
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
};

export default SupportPage;