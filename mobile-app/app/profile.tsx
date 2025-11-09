import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
	const { user, signOut } = useAuth();

	const displayName = useMemo(() => {
		if (user?.email) {
			const local = user.email.split('@')[0];
			return local || 'User';
		}
		return 'Guest';
	}, [user?.email]);

	function handleLogout() {
		signOut();
		router.replace('/(auth)/login');
	}

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.label}>Name</Text>
				<Text style={styles.value}>{displayName}</Text>
			</View>
			<Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.9 }]}>
				<Text style={styles.logoutText}>Log Out</Text>
			</Pressable>
		</View>
	);
}

const BG = '#E9F1F6';
const CARD = '#ffffff';

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 12, backgroundColor: BG },
    card: { backgroundColor: CARD, borderRadius: 14, padding: 16, gap: 6, borderWidth: 1, borderColor: '#E6E9ED' },
	label: { color: '#637783', fontWeight: '600' },
	value: { color: '#123B4A', fontWeight: '800', fontSize: 16 },
	logoutButton: { marginTop: 12, backgroundColor: Colors.light.tint, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
	logoutText: { color: '#fff', fontWeight: '800' },
});
