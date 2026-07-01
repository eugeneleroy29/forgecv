'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Resumes() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchResumes()
    }
  }, [user])

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setResumes(data)
    setLoading(false)
  }

  const createResume = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: 'Untitled Resume',
        content: {},
        template: 'basic',
      })
      .select()
      .single()

    if (!error) {
      window.location.href = `/dashboard/resumes/${data.id}`
    }
  }

  if (loading) {
    return (
      <div className="px-8 py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Resumes</h1>
          <p className="text-foreground/60">Manage and edit your resumes</p>
        </div>
        <button
          onClick={createResume}
          className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          + New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-semibold mb-2">No resumes yet</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Create your first resume to get started
          </p>
          <button
            onClick={createResume}
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            + Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/dashboard/resumes/${resume.id}`}
              className="border border-border rounded-xl p-6 hover:border-accent transition-colors"
            >
              <div className="text-2xl mb-3">📄</div>
              <h3 className="font-semibold mb-1">{resume.title}</h3>
              <p className="text-xs text-foreground/40">
                Updated {new Date(resume.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}