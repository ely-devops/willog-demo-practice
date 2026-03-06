import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import WillogLogo from '@/assets/willog-logo.svg';
import WillogSymbolLogo from '@/assets/willog-symbol-logo.svg';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  // Watch form fields to determine button state
  const email = watch('email');
  const password = watch('password');
  const isFormFilled = email && password;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setLoginError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.email === 'master@willog.io' && data.password === 'willog') {
      login({
        id: 'user_001',
        email: data.email,
        name: 'Master User',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from = (location.state as any)?.from?.pathname || '/hightech';
      navigate(from, { replace: true });
    } else {
      setLoginError(t('auth.loginError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-16 px-6 py-3 flex items-center justify-between bg-gray-50">
        {/* Logo */}
        <img
          src={WillogLogo}
          alt="Willog"
          className="h-[1.375rem] w-auto"
        />

        {/* Language Selector */}
        <LanguageSelector />
      </header>

      {/* Main Content - Login Card */}
      <main
        className="flex items-center justify-center"
        style={{ height: 'calc(100vh - 64px)', marginTop: '-32px' }}
      >
        <div className="w-[31.25rem] h-[39.125rem] bg-white rounded-[var(--radius-4)] overflow-hidden relative">
          {/* Card Inner Content */}
          <div className="h-[29.125rem] flex flex-col items-center justify-between absolute inset-0 m-auto w-[31.25rem]">
            {/* Top Section - Logo and Title */}
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Symbol Logo */}
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src={WillogSymbolLogo}
                  alt="Willog Symbol"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h1 className="text-display-l text-gray-1000 text-center w-full">
                {t('auth.title')}
              </h1>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 w-[25rem]">
              {/* Input Fields Container */}
              <div className="flex flex-col gap-6 w-full">
                {/* Email Field */}
                <div className="flex flex-col gap-3 w-full">
                  <label className="text-label-m text-gray-800">
                    {t('auth.email')}
                  </label>
                  <div
                    className={`
                      flex items-center h-[3.125rem] px-4
                      border border-solid rounded-[var(--radius-1)]
                      transition-colors overflow-hidden
                      ${errors.email || loginError
                        ? 'border-red-500'
                        : 'border-[var(--border-gray-inactive)] focus-within:border-[var(--border-gray-active)]'
                      }
                    `}
                  >
                    <input
                      type="text"
                      {...register("email", { required: true })}
                      placeholder={t('auth.emailPlaceholder')}
                      className="
                        flex-1 text-label-m
                        text-gray-1000 placeholder:text-gray-600 placeholder:opacity-60
                        outline-none bg-transparent
                      "
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-3 w-full">
                  <label className="text-label-m text-gray-800">
                    {t('auth.password')}
                  </label>
                  <div
                    className={`
                      flex items-center h-[3.125rem] px-4
                      border border-solid rounded-[var(--radius-1)]
                      transition-colors overflow-hidden
                      ${errors.password || loginError
                        ? 'border-red-500'
                        : 'border-[var(--border-gray-inactive)] focus-within:border-[var(--border-gray-active)]'
                      }
                    `}
                  >
                    <input
                      type="password"
                      {...register("password", { required: true })}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="
                        flex-1 text-label-m
                        text-gray-1000 placeholder:text-gray-600 placeholder:opacity-60
                        outline-none bg-transparent
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {loginError && (
                <p className="text-label-xs text-red-500">{loginError}</p>
              )}

              {/* Button Group */}
              <div className="flex flex-col gap-6 w-full">
                {/* Login Button */}
                <button
                  type="submit"
                  disabled={!isFormFilled || isLoading}
                  className={`
                    flex items-center justify-center
                    w-full h-[3.125rem]
                    bg-[var(--bg-primary)] rounded-[var(--radius-1)]
                    text-[1.125rem] font-normal text-white
                    transition-opacity
                    ${(!isFormFilled || isLoading) ? 'opacity-30' : 'hover:bg-[var(--btn-primary-hover)]'}
                    disabled:cursor-not-allowed
                  `}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    t('auth.login')
                  )}
                </button>

                {/* Reset Password Link */}
                <p className="text-body-m text-gray-800 text-center w-full">
                  {t('auth.resetPassword')}
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
