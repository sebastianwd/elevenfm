import { EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { getProviders, signIn } from 'next-auth/react'
import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import { GithubIcon } from '../icons'
import { Input } from '../input'
import { WavesLoader } from '../loader'

type Inputs = {
  username: string
  password: string
}

interface AuthModalProps {
  onClose?: () => void
}

export const AuthModal = (props: AuthModalProps) => {
  const { onClose } = props

  const providers = useQuery({
    queryKey: ['authProviders'],
    queryFn: () => getProviders(),
    staleTime: Infinity,
  })

  const credentialsSignIn = useMutation({
    mutationFn: (data: Inputs) =>
      signIn(providers.data?.credentials.id, {
        ...data,
        callbackUrl: pathname?.includes('/auth') ? '/' : pathname || '/',
        redirect: false,
        action: authType,
      }),
    mutationKey: ['signIn', providers.data?.credentials.id],
  })

  const pathname = usePathname()

  const [authType, setAuthType] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid, errors },
  } = useForm<Inputs>()

  const getCredentialsError = (credentialsError: string = '') => {
    if (
      ['AccessDenied', 'CredentialsSignin', 'Configuration'].includes(
        credentialsError
      )
    ) {
      if (authType === 'login') {
        return 'Invalid credentials'
      }

      return 'Invalid credentials or username already taken'
    }
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!isDirty || !isValid) return

    const response = await credentialsSignIn.mutateAsync(data)

    if (!getCredentialsError(response?.error)) {
      onClose?.()
    }
  }

  const renderProviders = () => {
    if (providers.isPending) {
      return (
        <div className='flex h-full items-center justify-center'>
          <WavesLoader className='h-5' />
        </div>
      )
    }

    if (providers.isError) {
      return (
        <div className='flex h-full items-center justify-center'>
          <p>An error occurred. Please try again later.</p>
        </div>
      )
    }

    return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className='mb-1 block text-sm' htmlFor='username'>
            Username
          </label>
          <Input
            className='h-12'
            placeholder='bob'
            type='text'
            icon={<UserIcon className='size-6' />}
            id='username'
            {...register('username', { required: 'Username is required' })}
          />
          <label className='mb-1 mt-3 block text-sm' htmlFor='password'>
            Password
          </label>
          <Input
            className='mb-2 h-12'
            placeholder='••••••••••••••'
            type={showPassword ? 'text' : 'password'}
            icon={
              <button
                type='button'
                className='cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon className='size-6' />
                ) : (
                  <EyeSlashIcon className='size-6' />
                )}
              </button>
            }
            id='password'
            {...register('password', { required: 'Password is required' })}
          />
          <span className='text-sm text-neutral-300'>
            {authType === 'login' ? 'No account?' : 'Already registered?'}
          </span>{' '}
          <button
            type='button'
            onClick={() => {
              setAuthType(authType === 'login' ? 'signup' : 'login')
              credentialsSignIn.reset()
            }}
            className='cursor-pointer text-primary-500 hover:underline'
          >
            {authType === 'login' ? 'Register' : 'Log in'}
          </button>
          <button
            type='submit'
            className={twMerge(
              'w-full py-2 rounded-md flex items-center justify-center gap-2 transition-colors bg-neutral-200 font-medium h-12 text-surface-900 mt-7 disabled:opacity-80'
            )}
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {!isSubmitting && (authType === 'login' ? 'Log in' : 'Sign up')}
            {isSubmitting && 'Authenticating...'}
          </button>
          <span
            className={twMerge(
              'text-red-500 text-sm invisible',
              (errors.username?.message ||
                errors.password?.message ||
                getCredentialsError(credentialsSignIn.data?.error)) &&
                'visible'
            )}
          >
            {errors.username?.message ||
              errors.password?.message ||
              getCredentialsError(credentialsSignIn.data?.error) ||
              '&nbsp;'}
          </span>
        </form>
        <span className='mx-auto mb-6 mt-2 block w-fit'>Or</span>
        <div className='rounded-md bg-gradient-to-br from-primary-500 to-blue-600  p-px'>
          <button
            type='button'
            key={providers.data?.github.id}
            onClick={() =>
              signIn(providers.data?.github.id, {
                callbackUrl: pathname?.includes('/auth')
                  ? '/'
                  : pathname || '/',
              })
            }
            className={twMerge(
              'w-full py-2 rounded-md flex items-center justify-center gap-2 transition-colors bg-surface-800 font-medium h-12'
            )}
          >
            <GithubIcon className='w-6' />
            {authType === 'login' ? 'Log in' : 'Sign up'} with{' '}
            {providers.data?.github.name}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className='w-96 max-w-full px-12 py-8 md:w-[calc(100vw/2)] lg:w-[calc(100vw/3)] lg:max-w-md'>
      {renderProviders()}
    </div>
  )
}
