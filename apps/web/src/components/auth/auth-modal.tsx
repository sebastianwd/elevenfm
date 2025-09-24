import { EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline'
import { authClient } from '@repo/api/auth/auth.client'
import { useMutation } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import { GithubIcon } from '../icons'
import { Input } from '../input'

type Inputs = {
  username: string
  password: string
}

interface AuthModalProps {
  onClose?: () => void
}

export const AuthModal = (props: AuthModalProps) => {
  const credentialsSignIn = useMutation({
    mutationFn: (data: Inputs) =>
      authClient.signIn.username({
        callbackURL: pathname.includes('/auth') ? '/' : pathname || '/',
        password: data.password,
        username: data.username,
      }),
    mutationKey: ['signIn'],
  })

  const pathname = usePathname()

  const [authType, setAuthType] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid, errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!isDirty || !isValid) return

    await credentialsSignIn.mutateAsync(data)

    props.onClose?.()
  }

  const renderProviders = () => {
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
          <label className='mt-3 mb-1 block text-sm' htmlFor='password'>
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
              'mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-neutral-200 py-2 font-medium text-surface-900 transition-colors disabled:opacity-80'
            )}
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {!isSubmitting && (authType === 'login' ? 'Log in' : 'Sign up')}
            {isSubmitting && 'Authenticating...'}
          </button>
          <span
            className={twMerge(
              'invisible text-sm text-red-500',
              (errors.username?.message ||
                errors.password?.message ||
                credentialsSignIn.data?.error?.message) &&
                'visible'
            )}
          >
            {errors.username?.message ||
              errors.password?.message ||
              credentialsSignIn.data?.error?.message ||
              '&nbsp;'}
          </span>
        </form>
        <span className='mx-auto mt-2 mb-6 block w-fit'>Or</span>
        <div className='rounded-md bg-gradient-to-br from-primary-500 to-blue-600 p-px'>
          <button
            type='button'
            key='github'
            onClick={() =>
              authClient.signIn.social({
                provider: 'github',
                callbackURL: pathname.includes('/auth') ? '/' : pathname || '/',
              })
            }
            className={twMerge(
              'flex h-12 w-full items-center justify-center gap-2 rounded-md bg-surface-800 py-2 font-medium transition-colors'
            )}
          >
            <GithubIcon className='w-6' />
            {authType === 'login' ? 'Log in' : 'Sign up'} with Github
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
