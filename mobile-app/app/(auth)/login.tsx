import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, Text, TextInput, TouchableWithoutFeedback, View, ScrollView } from 'react-native';

export default function LoginScreen() {
	const { signIn, signUp } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [keepSignedIn, setKeepSignedIn] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleSignIn() {
		try {
			setLoading(true);
			await signIn(username, password);
			router.replace('/(tabs)');
		} catch (error: any) {
			Alert.alert('Sign in failed', error?.message ?? 'Please try again.');
		} finally {
			setLoading(false);
		}
	}

	async function handleSignUp() {
		try {
			setLoading(true);
			await signUp(username, password);
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
						<Text style={styles.tagline}>Sign in to access your vehicle diagnostic dashboard</Text>
					</View>

					<View style={styles.featureCard}>
						<View style={styles.featureIconContainer}>
							<Ionicons name="car-sport" size={24} color="#ffffff" />
						</View>
						<View style={styles.featureTextContainer}>
							<Text style={styles.featureTitle}>Smart Car Health Monitor</Text>
							<Text style={styles.featureDescription}>Your car&apos;s health at your fingertips</Text>
						</View>
					</View>

					<View style={styles.formSection}>
						<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Username or Email</Text>
							<View style={styles.inputContainer}>
								<Ionicons name="person-outline" size={20} color="#9BA1A6" style={styles.inputIcon} />
								<TextInput
									style={styles.textInput}
									value={username}
									onChangeText={setUsername}
								placeholder="Username or email"
									autoCapitalize="none"
								autoComplete="email"
								keyboardType="default"
									placeholderTextColor="#9BA1A6"
									returnKeyType="next"
									blurOnSubmit={false}
								/>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<View style={styles.passwordHeader}>
								<Text style={styles.inputLabel}>Password</Text>
								<Pressable onPress={() => router.push("/(auth)/forgot-password")} hitSlop={8}>
								<Text style={styles.forgotPassword}>Forgot password?</Text>
							</Pressable>
							</View>
							<View style={styles.inputContainer}>
								<Ionicons name="lock-closed-outline" size={20} color="#9BA1A6" style={styles.inputIcon} />
								<TextInput
									style={styles.textInput}
									value={password}
									onChangeText={setPassword}
									placeholder="Enter your password"
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									autoComplete="password"
									placeholderTextColor="#9BA1A6"
									returnKeyType="done"
									onSubmitEditing={handleSignIn}
								/>
								<Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.visibilityButton}>
									<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9BA1A6" />
								</Pressable>
							</View>
							<Text style={styles.passwordHint}>Password must be at least 6 characters</Text>
						</View>

						<View style={styles.toggleContainer}>
							<Switch
								value={keepSignedIn}
								onValueChange={setKeepSignedIn}
								trackColor={{ false: '#E1E5E9', true: ACCENT_BLUE }}
								thumbColor="#ffffff"
								ios_backgroundColor="#E1E5E9"
							/>
							<Text style={styles.toggleText}>Keep me signed in</Text>
						</View>

						<Pressable 
							onPress={handleSignIn} 
							disabled={loading} 
							style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
						>
							<Ionicons name="arrow-forward" size={20} color="#ffffff" />
							<Text style={styles.signInButtonText}>Sign in to Dashboard</Text>
						</Pressable>
					</View>

					<View style={styles.bottomSection}>
						<View style={styles.accountLinks}>
							<Text style={styles.accountText}>Don&apos;t have an account?</Text>
							<Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/signup')} disabled={loading}>
								<Text style={styles.createAccountLink}>Create account</Text>
							</Pressable>
						</View>
						<Text style={styles.footerText}>AutoPulse: Vehicle Diagnostic System</Text>
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
const GRAY_TEXT = '#586C76';
const BORDER_COLOR = '#D1D9DE';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BG,
		paddingHorizontal: 24,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	topSection: {
		alignItems: 'center',
		marginTop: 80,
		marginBottom: 32,
	},
	brandContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	logoContainer: {
		position: 'relative',
		marginRight: 12,
		width: 36,
		height: 36,
		justifyContent: 'center',
		alignItems: 'center',
	},
	brandName: {
		fontSize: 28,
		fontWeight: '800',
		color: ACCENT_BLUE,
	},
	tagline: {
		fontSize: 16,
		color: GRAY_TEXT,
		textAlign: 'center',
		lineHeight: 22,
	},
	featureCard: {
		backgroundColor: CARD,
		borderRadius: 16,
		padding: 20,
		marginBottom: 32,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	featureIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: ACCENT_BLUE,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	featureTextContainer: {
		flex: 1,
	},
	featureTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: ACCENT_BLUE,
		marginBottom: 4,
	},
	featureDescription: {
		fontSize: 14,
		color: GRAY_TEXT,
	},
	formSection: {
		marginBottom: 32,
	},
	inputGroup: {
		marginBottom: 20,
	},
	passwordHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: DARK_TEXT,
		marginBottom: 8,
	},
	forgotPassword: {
		fontSize: 14,
		color: ACCENT_BLUE,
		fontWeight: '500',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: CARD,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: BORDER_COLOR,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	inputIcon: {
		marginRight: 12,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		color: DARK_TEXT,
	},
			visibilityButton: {
				marginLeft: 8,
			},
	passwordHint: {
		fontSize: 12,
		color: GRAY_TEXT,
		marginTop: 8,
		textAlign: 'right',
	},
	toggleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
	},
	toggleText: {
		marginLeft: 12,
		fontSize: 16,
		color: DARK_TEXT,
		fontWeight: '500',
	},
	signInButton: {
		backgroundColor: ACCENT_BLUE,
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	buttonPressed: {
		opacity: 0.9,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	signInButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
		marginLeft: 8,
	},
	bottomSection: {
		alignItems: 'center',
		marginTop: 'auto',
		paddingBottom: 40,
	},
	accountLinks: {
		alignItems: 'center',
		marginBottom: 24,
	},
	accountText: {
		fontSize: 16,
		color: DARK_TEXT,
		marginBottom: 8,
	},
    createAccountLink: {
        fontSize: 16,
        color: ACCENT_BLUE,
        fontWeight: '700',
    },
	footerText: {
		fontSize: 14,
		color: LIGHT_TEXT,
		textAlign: 'center',
	},
}); 