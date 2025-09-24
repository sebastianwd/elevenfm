import { valibotResolver } from '@hookform/resolvers/valibot'
import { useSession } from '@repo/api/auth/auth.client'
import { orpc } from '@repo/api/lib/orpc.client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { isEmpty } from 'es-toolkit/compat'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

import { Button } from '../button'
import { GithubIcon, Loader } from '../icons'
import { Input } from '../input'
import { Toast } from '../toast'

interface MyAccountModalProps {
  onClose?: () => void
}

type Inputs = {
  username: string
  name: string
  email: string
  password: string
  newPassword: string
}

const schema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.nonEmpty('Username is required'),
      v.minLength(3, 'Needs to be at least 3 characters'),
      v.maxLength(255, 'Username is too long')
    ),
    email: v.union([
      v.literal(''),
      v.pipe(
        v.string(),
        v.email('Invalid email'),
        v.maxLength(255, 'Email is too long')
      ),
    ]),
    password: v.union([v.literal(''), v.string()]),
    newPassword: v.union([v.literal(''), v.string()]),
    name: v.union([v.literal(''), v.string()]),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['newPassword']],
      (input) => {
        if (!input.password && input.newPassword) {
          return false
        }
        return true
      },
      'Both fields are required to change password'
    ),
    ['password']
  ),
  v.forward(
    v.partialCheck(
      [['password'], ['newPassword']],
      (input) => {
        if (input.password && !input.newPassword) {
          return false
        }
        return true
      },
      'Both fields are required to change password'
    ),
    ['newPassword']
  )
)

export const MyAccountModal = (props: MyAccountModalProps) => {
  const { onClose } = props
  const session = useSession()

  const me = useQuery(
    orpc.user.me.queryOptions({
      enabled: !!session.data?.user.id,
      staleTime: Infinity,
    })
  )

  const updateUser = useMutation(orpc.user.update.mutationOptions())

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<Inputs>({
    mode: 'onBlur',
    values: {
      username: me.data?.username ?? '',
      email: me.data?.email ?? '',
      name: me.data?.name ?? '',
      password: '',
      newPassword: '',
    },
    resolver: valibotResolver(schema),
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await updateUser.mutateAsync({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        newPassword: data.newPassword,
      })

      session.refetch()

      reset({}, { keepValues: true })

      toast.custom(() => <Toast message='✔ User updated' />, {
        duration: 3000,
      })

      await me.refetch()
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.custom(
          () => (
            <Toast
              message={`❌ ${error.message}`}
              className='bg-red-700 text-neutral-100'
            />
          ),
          { duration: 4000 }
        )
        return
      }
      toast.custom(() => <Toast message='❌ An error occurred' />)
    }
  }

  const renderPasswordSection = () => {
    if (me.data?.hasPassword) {
      return (
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <label
              className='text-sm font-medium text-gray-300'
              htmlFor='password'
            >
              Current password
            </label>
            <Input
              className='w-full'
              placeholder='Enter current password'
              id='password'
              type='password'
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <div className='space-y-2'>
            <label
              className='text-sm font-medium text-gray-300'
              htmlFor='newPassword'
            >
              New password
            </label>
            <Input
              className='w-full'
              placeholder='Enter new password'
              type='password'
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
          </div>
        </div>
      )
    }

    return (
      <div className='space-y-2'>
        <label
          className='text-sm font-medium text-gray-300'
          htmlFor='newPassword'
        >
          Set password
        </label>
        <Input
          className='w-full'
          placeholder='Enter new password'
          type='password'
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
      </div>
    )
  }

  const renderAccountsSection = () => {
    if (
      isEmpty(me.data?.accounts) ||
      !me.data?.accounts.find((account) => account.providerId !== 'credential')
    ) {
      return null
    }

    return (
      <div className='space-y-3'>
        {me.data.accounts
          .filter((account) => account.providerId !== 'credential')
          .map((account) => (
            <div
              className='flex items-center justify-between rounded-lg bg-surface-800 p-4'
              key={account.providerId}
            >
              <div className='flex items-center space-x-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-700'>
                  <GithubIcon className='h-5 w-5 text-gray-300' />
                </div>
                <div>
                  <p className='font-medium text-white capitalize'>
                    {account.providerId}
                  </p>
                  <p className='text-sm text-gray-400'>Connected account</p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 rounded-full bg-green-500' />
                <span className='text-sm text-green-400'>Connected</span>
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className='w-full max-w-2xl p-0'>
      {me.isPending ? (
        <div className='flex h-96 items-center justify-center rounded-2xl bg-surface-900'>
          <div className='flex flex-col items-center space-y-4'>
            <Loader className='h-12 w-12 text-primary-500' />
            <p className='text-gray-400'>Loading account information...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className='relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-8 py-8'>
            <div className='absolute inset-0 bg-black/20' />
            <div className='relative z-10'>
              <div className='flex items-center space-x-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                  <span className='text-2xl font-bold text-white'>
                    {session.data?.user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-white'>
                    Account Settings
                  </h1>
                  <p className='text-white/80'>
                    Manage your personal information
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className='absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10' />
            <div className='absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5' />
          </div>

          {/* Content Section */}
          <div className='rounded-b-2xl bg-surface-900 px-8 py-8'>
            <form className='space-y-8' onSubmit={handleSubmit(onSubmit)}>
              {/* Profile Section */}
              <div className='space-y-6'>
                <div className='border-b border-surface-700 pb-6'>
                  <h2 className='mb-4 text-lg font-semibold text-white'>
                    Profile
                  </h2>
                  <div className='grid gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label
                        className='text-sm font-medium text-gray-300'
                        htmlFor='username'
                      >
                        Username
                      </label>
                      <Input
                        className='w-full'
                        id='username'
                        required
                        error={errors.username?.message}
                        {...register('username', { required: true })}
                      />
                    </div>
                    <div className='space-y-2'>
                      <label
                        className='text-sm font-medium text-gray-300'
                        htmlFor='email'
                      >
                        Email
                      </label>
                      <Input
                        className='w-full'
                        type='email'
                        id='email'
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className='border-b border-surface-700 pb-6'>
                  <h2 className='mb-4 text-lg font-semibold text-white'>
                    Password
                  </h2>
                  <div className='space-y-4'>{renderPasswordSection()}</div>
                </div>

                {/* Connected Accounts */}
                {renderAccountsSection() && (
                  <div>
                    <h2 className='mb-4 text-lg font-semibold text-white'>
                      Connected Accounts
                    </h2>
                    <div className='space-y-4'>{renderAccountsSection()}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-3 pt-6'>
                <Button
                  onClick={onClose}
                  variant='ghost'
                  className='px-6 py-2 text-gray-400 hover:bg-surface-800 hover:text-white'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  className='px-6 py-2 font-medium'
                  disabled={!isDirty || updateUser.isPending}
                >
                  {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
