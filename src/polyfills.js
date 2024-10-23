import { Buffer } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
}

// Add this line to handle 'pg-native' import
if (typeof window !== 'undefined') {
  window.pgNative = null;
}

// Add this to handle 'webworker-threads' import
if (typeof window !== 'undefined') {
  window.webworkerThreads = null;
}
