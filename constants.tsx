
import React from 'react';
import { BeautyService } from './types';

export const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400';

export const PREDEFINED_GALLERY = [
  { id: 'nail1', url: 'https://images.unsplash.com/photo-1632345031435-81979cd75a39?w=400', label: 'Unhas Clássicas', category: 'Unhas' },
  { id: 'nail2', url: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=400', label: 'Alongamento', category: 'Unhas' },
  { id: 'hair1', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400', label: 'Corte/Escova', category: 'Cabelo' },
  { id: 'hair2', url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', label: 'Coloração', category: 'Cabelo' },
  { id: 'makeup1', url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', label: 'Maquiagem Social', category: 'Maquiagem' },
  { id: 'skin1', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', label: 'Limpeza de Pele', category: 'Estética' },
  { id: 'brow1', url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', label: 'Sobrancelhas', category: 'Estética' },
  { id: 'generic1', url: DEFAULT_SERVICE_IMAGE, label: 'Cuidado Geral', category: 'Outros' }
];

export const ICONS = {
  BeautySparkle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3V5M3 5H5M19 19V21M21 21H19M13 3L11.707 5.293L10 6L11.707 6.707L13 9L14.293 6.707L16 6L14.293 5.293L13 3ZM7 11L5.293 14.293L3 16L5.293 17.707L7 21L8.707 17.707L11 16L8.707 14.293L7 11ZM17 7L16.138 9.138L14 10L16.138 10.862L17 13L17.862 10.862L20 10L17.862 9.138L17 7Z" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
    </svg>
  ),
  Google: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.172-1.228 1.228-3.14 2.56-6.6 2.56-5.32 0-9.624-4.328-9.624-9.652S6.48 1.628 11.8 1.628c2.936 0 5.168 1.152 6.76 2.64l2.312-2.312C18.66.4 15.688-1.2 11.808-1.2-5.112-1.2 1.6 4.048 1.6 10.512s4.312 11.712 10.208 11.712c3.192 0 5.608-1.048 7.56-3.112 2.016-2.016 2.656-4.848 2.656-7.184 0-.688-.056-1.336-.16-1.936L12.48 10.92z"/>
    </svg>
  ),
  Wallet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Scissors: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-2 3 2 4-7c.1-.1.3-.1.4 0 .1.1.1.3 0 .4L13 12l4 7c.1.1.1.3 0 .4-.1.1-.3.1-.4 0l-4-7-3 2-3-2L3 19.4c-.1.1-.3.1-.4 0-.1-.1-.1-.3 0-.4L7 12z" />
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
};
