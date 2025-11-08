import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
Alert,
KeyboardAvoidingView,
Platform,
Pressable,
ScrollView,
StyleSheet,
Text,
TextInput,
View,
} from "react-native";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
const [step, setStep] = useState<"email" | "reset">("email");
const [email, setEmail] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const handleVerifyEmail = async () => {
if (!email.trim()) {
Alert.alert("Error", "Please enter your email address");
return;
}

setLoading(true);
try {
// Check if email exists in database
const { data, error } = await supabase
.from("users")
.select("email")
.eq("email", email.toLowerCase().trim())
.single();

if (error || !data) {
Alert.alert("Error", "Email address not found in our system");
return;
}

// Email found, proceed to reset step
setStep("reset");
} catch (error) {
console.error("Email verification error:", error);
Alert.alert("Error", "Failed to verify email. Please try again.");
} finally {
setLoading(false);
}
};

const handleResetPassword = async () => {
if (!newPassword || !confirmPassword) {
Alert.alert("Error", "Please fill in all fields");
return;
}

if (newPassword.length < 6) {
Alert.alert("Error", "Password must be at least 6 characters");
return;
}

if (newPassword !== confirmPassword) {
Alert.alert("Error", "Passwords do not match");
return;
}

setLoading(true);
try {
// Update password in users table
const { error } = await supabase
.from("users")
.update({ 
password: newPassword,
updated_at: new Date().toISOString()
})
.eq("email", email.toLowerCase().trim());

if (error) {
throw error;
}

Alert.alert(
"Success",
"Your password has been reset successfully!",
[
{
text: "OK",
onPress: () => router.replace("/(auth)/login"),
},
]
);
} catch (error) {
console.error("Password reset error:", error);
Alert.alert("Error", "Failed to reset password. Please try again.");
} finally {
setLoading(false);
}
};

return (
<KeyboardAvoidingView
style={{ flex: 1 }}
behavior={Platform.OS === "ios" ? "padding" : "height"}
keyboardVerticalOffset={0}
>
<ScrollView
style={styles.container}
contentContainerStyle={styles.contentContainer}
keyboardShouldPersistTaps="handled"
showsVerticalScrollIndicator={true}
bounces={true}
>
<View style={styles.header}>
<Pressable
onPress={() => router.back()}
style={styles.backButton}
hitSlop={8}
>
<Ionicons name="arrow-back" size={24} color="#1c1b1f" />
</Pressable>
</View>

<View style={styles.titleContainer}>
<View style={styles.iconContainer}>
<Ionicons name="lock-closed" size={32} color="#0A7EA4" />
</View>
<Text style={styles.title}>
{step === "email" ? "Forgot Password?" : "Reset Password"}
</Text>
<Text style={styles.subtitle}>
{step === "email"
? "Enter your email address to reset your password"
: "Enter your new password"}
</Text>
</View>

<View style={styles.form}>
{step === "email" ? (
<>
<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>Email Address</Text>
<View style={styles.inputContainer}>
<Ionicons
name="mail-outline"
size={20}
color="#9BA1A6"
style={styles.inputIcon}
/>
<TextInput
style={styles.textInput}
value={email}
onChangeText={setEmail}
placeholder="Enter your email"
autoCapitalize="none"
autoComplete="email"
keyboardType="email-address"
placeholderTextColor="#9BA1A6"
returnKeyType="done"
onSubmitEditing={handleVerifyEmail}
/>
</View>
</View>

<Pressable
onPress={handleVerifyEmail}
style={[
styles.button,
loading && styles.buttonDisabled,
]}
disabled={loading}
>
<Text style={styles.buttonText}>
{loading ? "Verifying..." : "Continue"}
</Text>
</Pressable>
</>
) : (
<>
<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>New Password</Text>
<View style={styles.inputContainer}>
<Ionicons
name="lock-closed-outline"
size={20}
color="#9BA1A6"
style={styles.inputIcon}
/>
<TextInput
style={styles.textInput}
value={newPassword}
onChangeText={setNewPassword}
placeholder="Enter new password"
secureTextEntry={!showNewPassword}
autoCapitalize="none"
autoComplete="password-new"
placeholderTextColor="#9BA1A6"
returnKeyType="next"
/>
<Pressable
onPress={() => setShowNewPassword((v) => !v)}
hitSlop={8}
style={styles.visibilityButton}
>
<Ionicons
name={
showNewPassword
? "eye-off-outline"
: "eye-outline"
}
size={20}
color="#9BA1A6"
/>
</Pressable>
</View>
<Text style={styles.passwordHint}>
Password must be at least 6 characters
</Text>
</View>

<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>Confirm Password</Text>
<View style={styles.inputContainer}>
<Ionicons
name="lock-closed-outline"
size={20}
color="#9BA1A6"
style={styles.inputIcon}
/>
<TextInput
style={styles.textInput}
value={confirmPassword}
onChangeText={setConfirmPassword}
placeholder="Re-enter new password"
secureTextEntry={!showConfirmPassword}
autoCapitalize="none"
autoComplete="password-new"
placeholderTextColor="#9BA1A6"
returnKeyType="done"
onSubmitEditing={handleResetPassword}
/>
<Pressable
onPress={() => setShowConfirmPassword((v) => !v)}
hitSlop={8}
style={styles.visibilityButton}
>
<Ionicons
name={
showConfirmPassword
? "eye-off-outline"
: "eye-outline"
}
size={20}
color="#9BA1A6"
/>
</Pressable>
</View>
</View>

<Pressable
onPress={handleResetPassword}
style={[
styles.button,
loading && styles.buttonDisabled,
]}
disabled={loading}
>
<Text style={styles.buttonText}>
{loading ? "Resetting..." : "Reset Password"}
</Text>
</Pressable>
</>
)}
</View>

<View style={styles.footer}>
<Text style={styles.footerText}>Remember your password? </Text>
<Pressable onPress={() => router.replace("/(auth)/login")}>
<Text style={styles.footerLink}>Sign in</Text>
</Pressable>
</View>
</ScrollView>
</KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#FFFFFF",
},
contentContainer: {
flexGrow: 1,
padding: 24,
paddingTop: 60,
paddingBottom: 40,
},
header: {
marginBottom: 32,
},
backButton: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: "#F5F7FA",
alignItems: "center",
justifyContent: "center",
},
titleContainer: {
marginBottom: 32,
alignItems: "center",
},
iconContainer: {
width: 80,
height: 80,
borderRadius: 40,
backgroundColor: "#E8F1F7",
alignItems: "center",
justifyContent: "center",
marginBottom: 16,
},
title: {
fontSize: 28,
fontWeight: "700",
color: "#1c1b1f",
marginBottom: 8,
textAlign: "center",
},
subtitle: {
fontSize: 16,
color: "#6B7280",
textAlign: "center",
lineHeight: 22,
paddingHorizontal: 16,
},
form: {
gap: 20,
},
inputGroup: {
gap: 8,
},
inputLabel: {
fontSize: 14,
fontWeight: "600",
color: "#374151",
marginBottom: 4,
},
inputContainer: {
flexDirection: "row",
alignItems: "center",
backgroundColor: "#F5F7FA",
borderRadius: 12,
paddingHorizontal: 16,
height: 54,
borderWidth: 1,
borderColor: "#E5E7EB",
},
inputIcon: {
marginRight: 12,
},
textInput: {
flex: 1,
fontSize: 16,
color: "#1c1b1f",
},
visibilityButton: {
padding: 4,
},
passwordHint: {
fontSize: 12,
color: "#9BA1A6",
marginTop: 4,
},
button: {
backgroundColor: "#0A7EA4",
borderRadius: 12,
height: 54,
alignItems: "center",
justifyContent: "center",
marginTop: 8,
},
buttonDisabled: {
opacity: 0.6,
},
buttonText: {
color: "#FFFFFF",
fontSize: 16,
fontWeight: "600",
},
footer: {
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
marginTop: 32,
},
footerText: {
fontSize: 14,
color: "#6B7280",
},
footerLink: {
fontSize: 14,
color: "#0A7EA4",
fontWeight: "600",
},
});
