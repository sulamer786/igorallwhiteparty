"use client";

import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/utils/supabase/client';
import { ImagePlus, Send, Loader2, X } from 'lucide-react';

export default function CreatePost({ userId }: { userId: string }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Revoke Object URL on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Revoke previous URL before creating new one
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    setIsPosting(true);

    try {
      let publicImageUrl = null;

      if (file) {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const fileName = `${userId}-${Date.now()}.webp`;
        const uploadFile = new File([compressedFile], fileName, { type: 'image/webp' });

        const { error: uploadError } = await supabase.storage
          .from('hype_media')
          .upload(`public/${fileName}`, uploadFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hype_media')
          .getPublicUrl(`public/${fileName}`);

        publicImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('hype_posts')
        .insert({
          guest_id: userId,
          content: content.trim() || null,
          image_url: publicImageUrl,
        });

      if (dbError) throw dbError;

      setContent('');
      removeFile();
    } catch (err) {
      console.error("Failed to post:", err);
      alert("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Image Preview */}
      {previewUrl && (
        <div style={{ position: 'relative', width: 'fit-content', marginBottom: '0.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview" style={{ height: '80px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          <button
            type="button"
            onClick={removeFile}
            aria-label="Remove image"
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              background: '#1c1c1c',
              borderRadius: '50%',
              padding: '4px',
              color: '#f7f4ef',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#fffdfb',
        padding: '0.5rem',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        transition: 'border-color 0.3s',
      }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
          style={{
            padding: '0.5rem',
            color: 'var(--brand-gold)',
            borderRadius: '50%',
            transition: 'background 0.2s',
            background: 'transparent',
          }}
        >
          <ImagePlus size={22} />
        </button>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#1c1c1c',
            outline: 'none',
            fontSize: '1rem',
            padding: '0.5rem',
            fontFamily: 'inherit',
          }}
          disabled={isPosting}
        />

        <button
          type="submit"
          disabled={(!content.trim() && !file) || isPosting}
          aria-label="Send message"
          style={{
            background: (!content.trim() && !file) ? 'rgba(28,28,28,0.12)' : '#1c1c1c',
            color: '#f7f4ef',
            padding: '0.6rem',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background 0.3s',
          }}
        >
          {isPosting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} style={{ marginLeft: '2px' }} />}
        </button>
      </div>
    </form>
  );
}
