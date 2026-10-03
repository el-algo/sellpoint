export type RoleName = 'admin' | 'cashier';

export type SeedUser = {
  name: string;
  role: RoleName;
  pin: string;
};

export const SEED_ROLES: RoleName[] = ['admin', 'cashier'];

export const SEED_USERS: SeedUser[] = [
  { name: 'Mari', role: 'admin', pin: '1234' },
  { name: 'Lupita', role: 'cashier', pin: '0000' },
];
