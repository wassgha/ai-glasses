import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CorevizConfigModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (apiKey: string, entityId: string) => void;
    initialApiKey?: string;
    initialEntityId?: string;
}

export function CorevizConfigModal({
    visible,
    onClose,
    onSave,
    initialApiKey = '',
    initialEntityId = '',
}: CorevizConfigModalProps) {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [entityId, setEntityId] = useState(initialEntityId);

    const handleSave = () => {
        if (!apiKey.trim()) {
            Alert.alert('Error', 'Please enter your CoreViz API key');
            return;
        }

        if (!entityId.trim()) {
            Alert.alert('Error', 'Please enter your Entity ID');
            return;
        }

        onSave(apiKey.trim(), entityId.trim());
        onClose();
    };

    const handleCancel = () => {
        setApiKey(initialApiKey);
        setEntityId(initialEntityId);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                        <ThemedText>Cancel</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.title}>
                        CoreViz Configuration
                    </ThemedText>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <ThemedView style={styles.section}>
                        <View style={styles.iconHeader}>
                            <IconSymbol size={24} name="key.fill" color="#4CAF50" />
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                API Configuration
                            </ThemedText>
                        </View>

                        <ThemedText style={styles.description}>
                            Configure your CoreViz API credentials to enable automatic frame uploads.
                        </ThemedText>

                        <View style={styles.inputGroup}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>
                                API Key
                            </ThemedText>
                            <TextInput
                                style={styles.input}
                                value={apiKey}
                                onChangeText={setApiKey}
                                placeholder="Enter your CoreViz API key"
                                placeholderTextColor="#999"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <ThemedText style={styles.inputHelp}>
                                You can find your API key in your CoreViz dashboard settings.
                            </ThemedText>
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>
                                Entity ID
                            </ThemedText>
                            <TextInput
                                style={styles.input}
                                value={entityId}
                                onChangeText={setEntityId}
                                placeholder="Enter the Entity ID for uploads"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <ThemedText style={styles.inputHelp}>
                                The Entity ID specifies where your frames will be uploaded in your dataset.
                            </ThemedText>
                        </View>

                        <View style={styles.infoBox}>
                            <IconSymbol size={20} name="info.circle.fill" color="#2196F3" />
                            <View style={styles.infoContent}>
                                <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                                    How to get your credentials:
                                </ThemedText>
                                <ThemedText style={styles.infoText}>
                                    1. Log in to your CoreViz dashboard{'\n'}
                                    2. Go to Settings → API Keys{'\n'}
                                    3. Create a new API key{'\n'}
                                    4. Find your Entity ID in your dataset
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
    },
    cancelButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    iconHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 25,
        opacity: 0.8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    inputHelp: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 5,
        lineHeight: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 8,
        gap: 12,
        marginTop: 10,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        color: '#1976d2',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 13,
        color: '#1976d2',
        lineHeight: 18,
    },
});