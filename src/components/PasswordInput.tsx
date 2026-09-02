import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  inputClassName?: string;
}

/**
 * Input password dengan tombol mata untuk show/hide.
 * Styling default-nya ngikutin halaman login backoffice (Login/Reset).
 * Caller bisa override via inputClassName buat halaman lain.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, inputClassName, ...rest }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div className={`relative ${className ?? ''}`}>
        <input
          {...rest}
          ref={ref}
          type={show ? 'text' : 'password'}
          className={
            'w-full px-3 py-2 pr-10 bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 placeholder:text-gray-500 dark:placeholder:text-slate-500 disabled:opacity-50 ' +
            (inputClassName ?? '')
          }
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }
);

export default PasswordInput;
