'use client';

import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'warning30' | 'warning10' | 'messageSent' | 'celebration' | 'tick' | 'sessionStart';

interface UseSoundOptions {
  enabled?: boolean;
  volume?: number;
}

export function useSound(options: UseSoundOptions = {}) {
  const { enabled = true, volume = 0.5 } = options;
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate different sound types
  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (type) {
        case 'warning30':
          // Gentle two-tone alert (like a soft notification)
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, now); // A4
          oscillator.frequency.setValueAtTime(520, now + 0.15); // C5
          gainNode.gain.setValueAtTime(volume * 0.3, now);
          gainNode.gain.exponentialDecayToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;

        case 'warning10':
          // More urgent triple beep
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(880, now); // A5
          gainNode.gain.setValueAtTime(0, now);
          // Three quick beeps
          for (let i = 0; i < 3; i++) {
            const beepStart = now + i * 0.15;
            gainNode.gain.setValueAtTime(volume * 0.25, beepStart);
            gainNode.gain.setValueAtTime(0, beepStart + 0.1);
          }
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;

        case 'tick':
          // Soft tick for final countdown
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1000, now);
          gainNode.gain.setValueAtTime(volume * 0.15, now);
          gainNode.gain.exponentialDecayToValueAtTime(0.01, now + 0.05);
          oscillator.start(now);
          oscillator.stop(now + 0.05);
          break;

        case 'messageSent':
          // Soft click/whoosh
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
          gainNode.gain.setValueAtTime(volume * 0.2, now);
          gainNode.gain.exponentialDecayToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case 'celebration':
          // Triumphant fanfare-like sound
          playChord(ctx, [523.25, 659.25, 783.99], now, volume * 0.3, 0.3); // C major
          setTimeout(() => {
            playChord(ctx, [587.33, 739.99, 880], now, volume * 0.3, 0.3); // D major
          }, 200);
          setTimeout(() => {
            playChord(ctx, [659.25, 830.61, 987.77], now, volume * 0.4, 0.5); // E major
          }, 400);
          break;

        case 'sessionStart':
          // Energizing start sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(330, now); // E4
          oscillator.frequency.setValueAtTime(440, now + 0.1); // A4
          oscillator.frequency.setValueAtTime(550, now + 0.2); // C#5
          gainNode.gain.setValueAtTime(volume * 0.25, now);
          gainNode.gain.setValueAtTime(volume * 0.3, now + 0.1);
          gainNode.gain.setValueAtTime(volume * 0.35, now + 0.2);
          gainNode.gain.exponentialDecayToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [enabled, volume, getAudioContext]);

  // Helper function to play a chord
  const playChord = (ctx: AudioContext, frequencies: number[], startTime: number, vol: number, duration: number) => {
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialDecayToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    });
  };

  return { playSound };
}

// Add the missing method to GainNode prototype for older browsers
declare global {
  interface GainNode {
    exponentialDecayToValueAtTime(value: number, endTime: number): void;
  }
}

if (typeof window !== 'undefined' && window.GainNode && !GainNode.prototype.exponentialDecayToValueAtTime) {
  GainNode.prototype.exponentialDecayToValueAtTime = function(value: number, endTime: number) {
    this.gain.exponentialRampToValueAtTime(Math.max(value, 0.0001), endTime);
  };
}

export default useSound;
