export async function isAuthenticated() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/me`, {
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
