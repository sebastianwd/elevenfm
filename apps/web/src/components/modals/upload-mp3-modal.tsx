'use client'

import { orpc } from '@repo/api/lib/orpc.client'
import { Button } from '@repo/ui/components/button'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@repo/ui/components/dropzone'
import { Input } from '@repo/ui/components/input'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Loader } from '../icons'
import { Toast } from '../toast'

interface UploadMp3ModalProps {
  playlistId: string
  onUploadEnd: () => void
}

export function UploadMp3Modal({
  playlistId,
  onUploadEnd,
}: UploadMp3ModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [customMetadata, setCustomMetadata] = useState({
    title: '',
    artist: '',
    album: '',
  })

  const { mutate: generateUploadUrl, isPending: isGeneratingUrl } = useMutation(
    orpc.playlist.generateUploadUrl.mutationOptions({
      onSuccess: async (data) => {
        try {
          await uploadFileToR2(selectedFiles[0]!, data.uploadUrl)

          await processMetadataMutation.mutateAsync({
            playlistId,
            fileName: selectedFiles[0]!.name,
            fileSize: selectedFiles[0]!.size,
            contentType: selectedFiles[0]!.type,
            fileKey: data.fileKey,
            customTitle: customMetadata.title || undefined,
            customArtist: customMetadata.artist || undefined,
            customAlbum: customMetadata.album || undefined,
          })

          toast.custom(
            () => <Toast message='✔ Audio uploaded successfully' />,
            {
              duration: 3000,
            }
          )
          onUploadEnd()
        } catch (error) {
          toast.custom(
            () => (
              <Toast
                message={`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`}
              />
            ),
            {
              duration: 5000,
            }
          )
        }
      },
      onError: (error) => {
        toast.custom(
          () => <Toast message={`❌ Upload failed: ${error.message}`} />,
          {
            duration: 5000,
          }
        )
      },
    })
  )

  const processMetadataMutation = useMutation(
    orpc.playlist.processAudioUpload.mutationOptions()
  )

  const addSongMetadataMutation = useMutation(
    orpc.playlist.addSongMetadata.mutationOptions()
  )

  const { mutateAsync: addSongMetadata } = addSongMetadataMutation

  const uploadFileToR2 = async (file: File, uploadUrl: string) => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`)
    }
  }

  const handleFileSelect = useCallback((file: File) => {
    const maxSize = 20 * 1024 * 1024 // 20MB in bytes
    if (file.size > maxSize) {
      toast.custom(() => <Toast message='❌ File size exceeds 20MB limit' />, {
        duration: 5000,
      })
      return
    }

    if (
      !file.type.startsWith('audio/') &&
      !file.name.toLowerCase().endsWith('.mp3') &&
      !file.name.toLowerCase().endsWith('.m4a')
    ) {
      toast.custom(
        () => (
          <Toast message='❌ Invalid file type. Only MP3 and M4A files are allowed' />
        ),
        {
          duration: 5000,
        }
      )
      return
    }

    setSelectedFiles([file])
  }, [])

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]!)
      }
    },
    [handleFileSelect]
  )

  const handleUpload = useCallback(async () => {
    // If no file is selected, just add song with metadata (will search YouTube)
    if (selectedFiles.length === 0) {
      try {
        await addSongMetadata({
          playlistId,
          title: customMetadata.title.trim() || 'Unknown Title',
          artist: customMetadata.artist.trim() || 'Unknown Artist',
          album: customMetadata.album.trim() || undefined,
        })

        toast.custom(() => <Toast message='✔ Song added to playlist' />, {
          duration: 3000,
        })
        onUploadEnd()
      } catch (error) {
        console.error('Error adding song to playlist', error)
        toast.custom(
          () => <Toast message='❌ Failed to add song to playlist' />,
          {
            duration: 3000,
          }
        )
      }
      return
    }

    // Original file upload logic
    const file = selectedFiles[0]!
    generateUploadUrl({
      playlistId,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    })
  }, [
    selectedFiles,
    customMetadata,
    generateUploadUrl,
    playlistId,
    addSongMetadata,
    onUploadEnd,
  ])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='text-center'>
        <h2 className='text-xl font-semibold text-gray-100'>Create New Song</h2>
        <p className='mt-2 text-sm text-gray-400'>
          Add a song by uploading a file or just entering the details. Maximum
          file size: 20MB
        </p>
      </div>

      <Dropzone
        accept={{
          'audio/mpeg': ['.mp3'],
          'audio/mp3': ['.mp3'],
          'audio/mp4': ['.m4a'],
          'audio/x-m4a': ['.m4a'],
        }}
        maxSize={20 * 1024 * 1024} // 20MB
        maxFiles={1}
        onDrop={handleDrop}
        onError={(error: Error) => {
          toast.custom(() => <Toast message={`❌ ${error.message}`} />, {
            duration: 5000,
          })
        }}
        src={selectedFiles}
        className='min-h-[120px]'
      >
        <DropzoneEmptyState>
          <div className='text-center'>
            <p className='text-sm font-medium text-gray-100'>
              Choose an audio file
            </p>
            <p className='text-xs text-gray-400'>
              Drag and drop or click to select
            </p>
            <p className='text-xs text-gray-400'>
              Supports MP3 and M4A files up to 20MB
            </p>
          </div>
        </DropzoneEmptyState>

        <DropzoneContent>
          {selectedFiles.length > 0 && (
            <div className='text-center'>
              <p className='text-lg font-medium text-gray-100'>
                {selectedFiles[0]!.name}
              </p>
              <p className='text-sm text-gray-400'>
                {formatFileSize(selectedFiles[0]!.size)}
              </p>
            </div>
          )}
        </DropzoneContent>
      </Dropzone>

      <div className='space-y-4 pt-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label
              className='mb-2 block text-sm font-medium text-gray-100'
              htmlFor='title'
            >
              Song Title
            </label>
            <Input
              type='text'
              value={customMetadata.title}
              onChange={(e) =>
                setCustomMetadata((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder='Enter song title (optional)'
            />
          </div>

          <div>
            <label
              className='mb-2 block text-sm font-medium text-gray-100'
              htmlFor='artist'
            >
              Artist
            </label>
            <Input
              type='text'
              value={customMetadata.artist}
              onChange={(e) =>
                setCustomMetadata((prev) => ({
                  ...prev,
                  artist: e.target.value,
                }))
              }
              placeholder='Enter artist name (optional)'
            />
          </div>
        </div>

        <div>
          <label
            className='mb-2 block text-sm font-medium text-gray-100'
            htmlFor='album'
          >
            Album
          </label>
          <Input
            type='text'
            value={customMetadata.album}
            onChange={(e) =>
              setCustomMetadata((prev) => ({
                ...prev,
                album: e.target.value,
              }))
            }
            placeholder='Enter album name (optional)'
          />
        </div>
      </div>

      <div className='flex justify-end space-x-3 pt-4'>
        <Button
          onClick={() => {
            setSelectedFiles([])
            setCustomMetadata({ title: '', artist: '', album: '' })
            onUploadEnd()
          }}
          variant='secondary'
          className='px-6 py-2'
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant='primary'
          className='px-6 py-2 font-medium'
          disabled={
            isGeneratingUrl ||
            processMetadataMutation.isPending ||
            addSongMetadataMutation.isPending ||
            (selectedFiles.length === 0 &&
              (!customMetadata.title.trim() || !customMetadata.artist.trim()))
          }
        >
          {isGeneratingUrl ||
          processMetadataMutation.isPending ||
          addSongMetadataMutation.isPending ? (
            <>
              <Loader className='mr-2 h-4 w-4' />
              {isGeneratingUrl
                ? 'Generating URL...'
                : processMetadataMutation.isPending
                  ? 'Processing...'
                  : 'Adding Song...'}
            </>
          ) : selectedFiles.length > 0 ? (
            'Upload & Add Song'
          ) : (
            'Add Song'
          )}
        </Button>
      </div>
    </div>
  )
}
