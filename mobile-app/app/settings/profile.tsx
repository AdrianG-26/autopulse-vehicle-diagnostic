import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function ProfileSettingsScreen() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const email = user?.email ?? 'N/A';

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();
      if (isMounted) {
        if (!error && data?.username) setName(data.username);
        setLoading(false);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [user?.id]);

  const onSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ username: name.trim() || null })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      // no toast system here; keep UI simple
      return;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>User Profile Settings</ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="person" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Name</ThemedText>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={loading ? 'Loading…' : 'Enter your name'}
                editable={!loading}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="envelope" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Email</ThemedText>
            </View>
            <ThemedText style={styles.pendingText}>{email}</ThemedText>
          </View>

        </View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.buttonsRow}>
          <Pressable style={[styles.button, styles.buttonPrimary]} onPress={onSave} disabled={saving || loading}>
            <ThemedText style={styles.buttonText}>{saving ? 'Saving…' : 'Save'}</ThemedText>
          </Pressable>
          <Pressable style={[styles.button, styles.buttonDanger]} onPress={signOut}>
            <ThemedText style={styles.buttonText}>Log out</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1F6',
  },
  panelContainer: {
    padding: 20,
    backgroundColor: '#E9F1F6',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    color: '#123B4A',
  },
  panelCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6E9ED',
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  panelRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelRowLabel: {
    fontSize: 16,
    color: '#123B4A',
    fontWeight: '600',
  },
  panelDivider: {
    height: 1,
    backgroundColor: '#E6E9ED',
    marginVertical: 8,
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: '#E9F1F6',
  },
  inputContainer: {
    minWidth: 160,
    maxWidth: '60%',
  },
  input: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E6E9ED',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#123B4A',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7d86',
    fontStyle: 'italic',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: '#0a7ea4',
  },
  buttonDanger: {
    backgroundColor: '#d35400',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});


