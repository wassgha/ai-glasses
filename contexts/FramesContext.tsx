import { COREVIZ_CONFIG, isConfigurationValid } from '@/config/coreviz';
import { FrameMetadata, uploadFrame } from '@/services/corevizUpload';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'failed';

export interface CapturedFrame {
    uri: string;
    timestamp: string;
    fullTimestamp: Date;
    uploadStatus?: UploadStatus;
    uploadUrl?: string;
    uploadError?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    exif?: any; // EXIF data from camera including orientation
}

interface FramesContextType {
    capturedFrames: CapturedFrame[];
    addFrame: (frame: CapturedFrame) => void;
    clearFrames: () => void;
    isRecording: boolean;
    setIsRecording: (recording: boolean) => void;
    uploadFrame: (frameIndex: number) => Promise<void>;
    uploadAllFrames: () => Promise<void>;
    isUploading: boolean;
    uploadProgress: { current: number; total: number };
    apiKey: string;
    entityId: string;
    setApiCredentials: (apiKey: string, entityId: string) => void;
    isConfigured: boolean;
}

const FramesContext = createContext<FramesContextType | undefined>(undefined);

export function FramesProvider({ children }: { children: ReactNode }) {
    const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [apiKey, setApiKey] = useState(COREVIZ_CONFIG.API_KEY);
    const [entityId, setEntityId] = useState(COREVIZ_CONFIG.ENTITY_ID);

    const addFrame = (frame: CapturedFrame) => {
        setCapturedFrames(prev => [
            { ...frame, uploadStatus: 'idle' },
            ...prev
        ].slice(0, 50)); // Keep last 50 frames
    };

    const clearFrames = () => {
        setCapturedFrames([]);
    };

    const setApiCredentials = (newApiKey: string, newEntityId: string) => {
        setApiKey(newApiKey);
        setEntityId(newEntityId);
        // Update the config object directly
        (COREVIZ_CONFIG as any).API_KEY = newApiKey;
        (COREVIZ_CONFIG as any).ENTITY_ID = newEntityId;
    };

    const uploadSingleFrame = async (frameIndex: number): Promise<void> => {
        if (frameIndex < 0 || frameIndex >= capturedFrames.length) {
            console.error('Invalid frame index:', frameIndex);
            return;
        }

        const frame = capturedFrames[frameIndex];
        if (!frame || frame.uploadStatus === 'uploading') {
            return;
        }

        // Update frame status to uploading
        setCapturedFrames(prev =>
            prev.map((f, i) =>
                i === frameIndex
                    ? { ...f, uploadStatus: 'uploading' as UploadStatus }
                    : f
            )
        );

        try {
            const metadata: FrameMetadata = {
                width: frame.width,
                height: frame.height,
                fileSize: frame.fileSize,
                timestamp: frame.fullTimestamp,
                exif: frame.exif, // Pass camera EXIF data including orientation
            };

            const result = await uploadFrame(frame.uri, metadata);

            // Update frame with upload result
            setCapturedFrames(prev =>
                prev.map((f, i) =>
                    i === frameIndex
                        ? {
                            ...f,
                            uploadStatus: result.success ? 'uploaded' as UploadStatus : 'failed' as UploadStatus,
                            uploadUrl: result.url,
                            uploadError: result.error,
                        }
                        : f
                )
            );

            if (result.success) {
                console.log('Frame uploaded successfully:', result.url);
            } else {
                console.error('Frame upload failed:', result.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setCapturedFrames(prev =>
                prev.map((f, i) =>
                    i === frameIndex
                        ? {
                            ...f,
                            uploadStatus: 'failed' as UploadStatus,
                            uploadError: error instanceof Error ? error.message : 'Unknown error',
                        }
                        : f
                )
            );
        }
    };

    const uploadAllFrames = async (): Promise<void> => {
        if (isUploading || !isConfigurationValid()) {
            console.warn('Cannot upload: already uploading or not configured');
            return;
        }

        const unuploadedFrames = capturedFrames.filter(
            frame => frame.uploadStatus === 'idle' || frame.uploadStatus === 'failed'
        );

        if (unuploadedFrames.length === 0) {
            console.log('No frames to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress({ current: 0, total: unuploadedFrames.length });

        try {
            for (let i = 0; i < capturedFrames.length; i++) {
                const frame = capturedFrames[i];
                if (frame.uploadStatus === 'idle' || frame.uploadStatus === 'failed') {
                    await uploadSingleFrame(i);
                    setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

                    // Small delay between uploads
                    if (i < capturedFrames.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        } catch (error) {
            console.error('Batch upload error:', error);
        } finally {
            setIsUploading(false);
            setUploadProgress({ current: 0, total: 0 });
        }
    };

    const isConfigured = isConfigurationValid();

    return (
        <FramesContext.Provider
            value={{
                capturedFrames,
                addFrame,
                clearFrames,
                isRecording,
                setIsRecording,
                uploadFrame: uploadSingleFrame,
                uploadAllFrames,
                isUploading,
                uploadProgress,
                apiKey,
                entityId,
                setApiCredentials,
                isConfigured,
            }}
        >
            {children}
        </FramesContext.Provider>
    );
}

export function useFrames() {
    const context = useContext(FramesContext);
    if (context === undefined) {
        throw new Error('useFrames must be used within a FramesProvider');
    }
    return context;
}