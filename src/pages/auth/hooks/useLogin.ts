import { useState } from 'react';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    // Fake API call
    await new Promise((res) => setTimeout(res, 1000));
    if (username === 'admin' && password === 'admin') {
      // Success: thực tế sẽ dispatch hoặc lưu token
      setLoading(false);
      setError(null);
    } else {
      setLoading(false);
      setError('Invalid credentials');
    }
  };

  return { login, loading, error };
};

export default useLogin;
