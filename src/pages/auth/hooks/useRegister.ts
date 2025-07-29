import { useState } from 'react';

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (username: string, password: string, email: string) => {
    setLoading(true);
    setError(null);
    // Fake API call
    await new Promise((res) => setTimeout(res, 1000));
    if (username && password && email) {
      // Success: thực tế sẽ dispatch hoặc lưu token
      setLoading(false);
      setError(null);
    } else {
      setLoading(false);
      setError('Please fill all fields');
    }
  };

  return { register, loading, error };
};

export default useRegister;
