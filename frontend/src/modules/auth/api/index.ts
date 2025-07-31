export async function loginApi(email: string, password: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    return await res.json(); // tokens
  } catch (err: any) {
    throw new Error(err.message || 'Login failed');
  }
}

export async function registerApi(email: string, password: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    return await res.json(); // tokens
  } catch (err: any) {
    throw new Error(err.message || 'Registration failed');
  }
}

