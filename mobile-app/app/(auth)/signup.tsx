import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, ScrollView } from 'react-native';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignUp() {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await signUp(username, email, password);
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign up failed', error?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: 'height' })}
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 0, default: 20 })}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Ionicons name="battery-charging" size={32} color={ACCENT_BLUE} />
              </View>
              <Text style={styles.brandName}>AutoPulse</Text>
            </View>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9BA1A6" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholderTextColor="#9BA1A6"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9BA1A6" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholderTextColor="#9BA1A6"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9BA1A6" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  placeholderTextColor="#9BA1A6"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.visibilityButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9BA1A6" />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9BA1A6" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  placeholderTextColor="#9BA1A6"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <Pressable onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8} style={styles.visibilityButton}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9BA1A6" />
                </Pressable>
              </View>
              <Text style={styles.passwordHint}>Password must be at least 6 characters</Text>
            </View>

            <Pressable
              onPress={handleSignUp}
              disabled={loading}
              style={({ pressed }) => [styles.signUpButton, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            >
              <Ionicons name="person-add" size={20} color="#ffffff" />
              <Text style={styles.signUpButtonText}>Create Account</Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="arrow-back" size={18} color={ACCENT_BLUE} />
              <Text style={styles.secondaryButtonText}>Back to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const BG = '#E9F1F6';
const CARD = '#ffffff';
const ACCENT_BLUE = '#0A7EA4';
const DARK_TEXT = '#2C3E50';
const LIGHT_TEXT = '#7F8C8D';
const BORDER_COLOR = '#D1D9DE';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 24 },
  scrollContent: { paddingBottom: 40 },
  topSection: { alignItems: 'center', marginTop: 60, marginBottom: 32 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoContainer: { position: 'relative', marginRight: 12, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  brandName: { fontSize: 28, fontWeight: '800', color: ACCENT_BLUE },
  tagline: { fontSize: 16, color: '#586C76', textAlign: 'center', lineHeight: 22 },
  formSection: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: DARK_TEXT, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER_COLOR, paddingHorizontal: 16, paddingVertical: 14 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, color: DARK_TEXT },
  visibilityButton: { marginLeft: 8 },
  passwordHint: { fontSize: 12, color: '#586C76', marginTop: 8, textAlign: 'right' },
  signUpButton: { backgroundColor: ACCENT_BLUE, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.6 },
  signUpButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  secondaryButton: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10, alignSelf: 'stretch', justifyContent: 'center', borderWidth: 1, borderColor: '#C9D3DA' },
  secondaryButtonText: { color: ACCENT_BLUE, fontWeight: '800' },
});
