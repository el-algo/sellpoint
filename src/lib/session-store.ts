import { useSyncExternalStore } from 'react';
import type { User } from '@/lib/db-services';

type Listener = () => void;

let currentUser: User | null = null;

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getUserSnapshot() {
  return currentUser;
}

export function useCurrentUser(): User | null {
  return useSyncExternalStore(subscribe, getUserSnapshot, getUserSnapshot);
}

export function isAdmin(user: User | null): boolean {
  return user?.role_name === 'admin';
}

export function signIn(user: User) {
  currentUser = user;
  emit();
}

export function signOut() {
  currentUser = null;
  emit();
}
