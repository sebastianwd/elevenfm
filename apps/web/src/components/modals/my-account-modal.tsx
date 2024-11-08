import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { isEmpty } from 'lodash'
import { useSession } from 'next-auth/react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

import { meQuery, updateUserMutation } from '~/api'
import { getError } from '~/utils/get-error'

import { Button } from '../button'
import { GithubIcon } from '../icons'
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

  const me = useQuery({
    queryKey: ['me', session.data?.user?.id],
    queryFn: () => meQuery(),
    enabled: !!session.data?.user?.id,
    staleTime: Infinity,
  })

  const updateUser = useMutation({
    mutationKey: ['updateUser', session.data?.user?.id],
    mutationFn: updateUserMutation,
    onError: (err: ClientError) => err,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<Inputs>({
    mode: 'onBlur',
    values: {
      username: me.data?.me.username ?? '',
      email: me.data?.me.email ?? '',
      name: me.data?.me.name ?? '',
      password: '',
      newPassword: '',
    },
    resolver: valibotResolver(schema),
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await updateUser.mutateAsync({
        user: {
          username: data.username,
          name: data.name,
          email: data.email,
          password: data.password,
          newPassword: data.newPassword,
        },
      })

      await session.update({
        name: data.username,
        email: data.email,
      })

      reset({}, { keepValues: true })

      toast.custom(() => <Toast message='✔ User updated' />, {
        duration: 3000,
      })

      await me.refetch()
    } catch (error) {
      console.error(error)
      if (error instanceof ClientError) {
        toast.custom(
          () => (
            <Toast
              message={`❌ ${getError(error)}`}
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
    if (me.data?.me.hasPassword) {
      return (
        <>
          {' '}
          <label className='text-sm' htmlFor='password'>
            Change password
          </label>
          <div className='grid gap-2 md:grid-cols-2'>
            <div className='flex flex-col'>
              <Input
                className='text-sm'
                placeholder='Current password'
                id='password'
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
            <div className='flex flex-col'>
              <Input
                className='text-sm'
                placeholder='New password'
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <label className='text-sm' htmlFor='password'>
          New password
        </label>
        <Input
          className='text-sm'
          placeholder='New password'
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
      </>
    )
  }

  const renderAccountsSection = () => {
    if (isEmpty(me.data?.me.accounts)) {
      return null
    }

    return (
      <>
        <label className='text-sm' htmlFor='accounts'>
          Accounts
        </label>
        <div className='grid gap-2 md:grid-cols-2'>
          {me.data?.me.accounts.map((account) => (
            <div
              className='flex items-center justify-between space-x-4'
              key={account.provider}
            >
              <div className='flex items-center space-x-4'>
                <GithubIcon className='w-6' />
                <div>
                  <p className='text-sm font-medium leading-none'>
                    {account.provider}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className='w-96 max-w-full p-8 md:w-[calc(100vw/2)] lg:w-[calc(100vw/3)]'>
      <p className='mb-1 text-base'>Manage your personal information</p>
      <p className='mb-5 text-sm text-neutral-300'>
        Logged in as: {session.data?.user?.name}
      </p>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
        {/*
        <div className='w-fit'>
          <span className='text-sm'>Profile picture</span>
          <div className='flex gap-2 items-center'>
            <button
              className='flex items-center justify-center rounded-full bg-surface-800 ring-surface-800/70 focus-within:ring-2 grow size-16'
              type='button'
            >
              <Icon
                icon='solar:camera-outline'
                className='size-6 text-gray-400'
              />
            </button>
            <Button variant='ghost' className='text-sm flex gap-1 items-center'>
              <Icon icon='tabler:upload' className='size-6' />
              Upload
            </Button>
          </div>
        </div>
        */}
        <div>
          <label className='text-sm' htmlFor='username'>
            Username
          </label>
          <Input
            className='w-full text-sm'
            id='username'
            required
            error={errors.username?.message}
            {...register('username', { required: true })}
          />
        </div>
        <div>
          <label className='text-sm' htmlFor='email'>
            Email
          </label>
          <Input
            className='w-full text-sm'
            type='email'
            id='email'
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        <div>{renderPasswordSection()}</div>
        <div>{renderAccountsSection()}</div>
        <div className='mt-6 flex justify-end gap-4'>
          <Button onClick={onClose} variant='secondary' className='h-9 px-4'>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            className='h-9 px-4'
            disabled={!isDirty}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
